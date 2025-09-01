import { Router } from "express";
import multer from "multer";
import * as fs from "fs";
import { createReadStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Guard: required envs
const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = process.env;
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
console.log("AWS_REGION:", process.env.AWS_REGION);
if (
  !AWS_REGION ||
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY ||
  !AWS_BUCKET_NAME
) {
  console.error("Missing required AWS_* env vars. Check .env.");
}

// AWS S3 v3 Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../temp");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".pdf", ".doc", ".docx", ".rtf", ".odt"];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word, RTF, and ODT files are allowed"));
    }
  },
}).single("resume");

const cvpdfRouter = Router();

// cvpdfRouter.post("/:id", (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) return errorResponse(res, 400, err.message || "Upload error");
//     if (!req.file) return errorResponse(res, 400, "No file uploaded");

//     try {
//       const resumepdf = await jobapplicantmodel.findById(req.params.id);

//       if (!resumepdf) {
//         fs.unlinkSync(req.file.path);
//         return errorResponse(res, 404, "Record not found");
//       }

//       // Upload file to S3
//       const fileStream = createReadStream(req.file.path);
//       const fileName = `${req.params.id}-${Date.now()}-${
//         req.file.originalname
//       }`;
//       const s3Key = `resumes/${fileName}`; // All resumes go under "resumes/" folder

//       const uploadCommand = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: s3Key,
//         Body: fileStream,
//         ContentType: req.file.mimetype, // will auto-detect like application/pdf, application/msword, etc
//       });

//       await s3.send(uploadCommand);

//       const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

//       // Save single URL in the string field (update your schema accordingly)
//       resumepdf.pdf = fileUrl;
//       await resumepdf.save();

//       // Remove local file
//       fs.unlinkSync(req.file.path);

//       return successResponse(res, "Resume uploaded successfully", resumepdf);
cvpdfRouter.post("/:id", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      // Multer error (validation / size / etc.)
      return errorResponse(res, 400, err.message || "Upload error");
    }

    if (!req.file) return errorResponse(res, 400, "No file uploaded");

    let localPath;
    try {
      const applicantId = req.params.id;
      const resumepdf = await jobapplicantmodel.findById(applicantId);
      if (!resumepdf) {
        // cleanup local file
        localPath = req.file.path;
        if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath);
        return errorResponse(res, 404, "Record not found");
      }

      // Build S3 key and upload
      localPath = req.file.path;
      const orig = req.file.originalname || "resume";
      const safeOrig = orig.replace(/[^\w.\-]+/g, "_"); // sanitize name
      const fileName = `${applicantId}-${Date.now()}-${safeOrig}`;
      const s3Key = `resumes/${fileName}`;

      // Some providers/clients send odd mimetypes; fall back to octet-stream
      const contentType = req.file.mimetype || "application/octet-stream";

      const fileStream = createReadStream(localPath);
      const cmd = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: contentType,
      });

      await s3.send(cmd);

      const fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

      // Save URL into the applicant doc
      resumepdf.pdf = fileUrl;
      await resumepdf.save();

      // Remove local file after successful upload
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

      return successResponse(res, "Resume uploaded successfully", resumepdf);
    } catch (error) {
      if (fs.existsSync(req.file?.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 500, "Resume upload failed");
    }
  });
});

export default cvpdfRouter;

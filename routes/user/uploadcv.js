import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import getnumber from "../../helpers/helperFunction.js";
import fs from "fs";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkPdfFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(
    path.extname(file.originalname).toLocaleLowerCase()
  );
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error:PDFs only!"));
  }
}

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../pdfs");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: async (req, file, cb) => {
    try {
      const pid = req.params.id;
      const pdfnumber = await getnumber(pid);
      const id = Math.floor(Math.random() * 900000) + 1000;
      const ext = path.extname(file.originalname);
      const filename = `${pdfnumber}__${id}${ext}`;
      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  },
});

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    checkPdfFileType(file, cb);
  },
}).single("pdf");

const cvpdfRouter = Router();

cvpdfRouter.post("/:id", (req, res) => {
  pdfUpload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || "upload error");
    }
    if (!req.file) {
      return errorResponse(res, 400, "No File was uploaded");
    }

    try {
      const pdf = req.file.filename;
      const contactId = req.params.id;
      const updatedContactcv = await jobapplicantmodel.findByIdAndUpdate(
        contactId,
        { pdf: pdf },
        { new: true }
      );
      if (!updatedContactcv) {
        return errorResponse(res, 404, "contact cv not found");
      }
      successResponse(res, "PDF successfully uploaded cv");
    } catch (error) {
      console.log("error", error);
      errorResponse(res, 500, "internal server error");
    }
  });
});

export default cvpdfRouter;

// import { Router } from "express";
// import multer from "multer";
// import { google } from "googleapis";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import path from "path";
// import fs from "fs";
// import dotenv from "dotenv";
// import {
//   successResponse,
//   errorResponse,
// } from "../../helpers/serverResponse.js";
// import getnumber from "../../helpers/helperFunction.js";
// import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Multer storage (temp folder)
// const tempStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const tempPath = path.join(__dirname, "../../temp");
//     fs.mkdirSync(tempPath, { recursive: true });
//     cb(null, tempPath);
//   },
//   filename: async (req, file, cb) => {
//     try {
//       const pid = req.params.id;
//       const applicant = await jobapplicantmodel.findById(pid);
//       const fullName = applicant?.name || "Applicant";
//       const cleanName = fullName.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
//       const pdfnumber = await getnumber(pid);
//       const id = Math.floor(Math.random() * 900000) + 1000;
//       const ext = path.extname(file.originalname);
//       cb(null, `${cleanName}_${pdfnumber}__${id}${ext}`);
//     } catch (error) {
//       cb(error);
//     }
//   },
// });

// function checkPdfFileType(file, cb) {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const allowedExts = /\.(pdf|doc|docx)$/i;
//   const allowedMimes = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ];
//   if (allowedExts.test(ext) && allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF and Word documents (.doc, .docx) are allowed"));
//   }
// }

// const upload = multer({
//   storage: tempStorage,
//   fileFilter: (req, file, cb) => checkPdfFileType(file, cb),
// }).single("resume");

// // Google Drive Auth Setup
// const credentials = JSON.parse(fs.readFileSync("credentials.json"));
// const { client_secret, client_id, redirect_uris } = credentials.web;

// const oAuth2Client = new google.auth.OAuth2(
//   client_id,
//   client_secret,
//   redirect_uris[0]
// );
// oAuth2Client.setCredentials(JSON.parse(fs.readFileSync("token.json")));

// const drive = google.drive({ version: "v3", auth: oAuth2Client });

// const cvpdfRouter = Router();

// cvpdfRouter.post("/:id", (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) return errorResponse(res, 400, err.message || "Upload error");

//     if (!req.file) return errorResponse(res, 400, "No file was uploaded");

//     const tempFilePath = req.file.path;

//     try {
//       const applicant = await jobapplicantmodel.findById(req.params.id);
//       if (!applicant) {
//         fs.unlinkSync(tempFilePath);
//         return errorResponse(res, 404, "Applicant not found");
//       }

//       // Create/find Google Drive folder
//       const folderName = "cadilaJobApplicantsResume";
//       const folderQuery = await drive.files.list({
//         q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//         fields: "files(id)",
//       });

//       let folderId = folderQuery.data.files[0]?.id;
//       if (!folderId) {
//         const folder = await drive.files.create({
//           resource: {
//             name: folderName,
//             mimeType: "application/vnd.google-apps.folder",
//           },
//           fields: "id",
//         });
//         folderId = folder.data.id;
//       }

//       const ext = path.extname(tempFilePath).toLowerCase();
//       const mimeTypeMap = {
//         ".pdf": "application/pdf",
//         ".doc": "application/msword",
//         ".docx":
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       };

//       const media = {
//         mimeType: mimeTypeMap[ext] || "application/octet-stream",
//         body: fs.createReadStream(tempFilePath),
//       };

//       const uploaded = await drive.files.create({
//         resource: {
//           name: req.file.filename,
//           parents: [folderId],
//         },
//         media,
//         fields: "id, webViewLink",
//       });

//       // Try to make it public
//       try {
//         await drive.permissions.create({
//           fileId: uploaded.data.id,
//           requestBody: {
//             role: "reader",
//             type: "anyone",
//           },
//         });
//       } catch (permErr) {
//         // console.warn("Permission not granted:", permErr.message);
//       }

//       applicant.resume = uploaded.data.webViewLink;
//       await applicant.save();
//       fs.unlinkSync(tempFilePath);

//       successResponse(res, "Resume uploaded to Google Drive", applicant);
//     } catch (error) {
//       console.log("Upload error:", error);
//       if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
//       errorResponse(res, 500, "Internal server error during upload");
//     }
//   });
// });

// export default cvpdfRouter;

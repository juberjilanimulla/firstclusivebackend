// import { Router } from "express";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import {
//   successResponse,
//   errorResponse,
// } from "../../helpers/serverResponse.js";
// import getnumber from "../../helpers/helperFunction.js";
// import fs from "fs";
// import mongoose from "mongoose";
// import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Validate PDF file type
// function checkPdfFileType(file, cb) {
//   const filetypes = /pdf/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     cb(null, true);
//   } else {
//     cb(new Error("Error: Only PDF files are allowed!"));
//   }
// }

// // Storage for single PDF
// const pdfStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "../../pdfs");
//     fs.mkdirSync(uploadPath, { recursive: true });
//     cb(null, uploadPath);
//   },
//   filename: async (req, file, cb) => {
//     try {
//       const jid = req.params.id;
//       const jobapplicantnumber = await getnumber(jid);
//       // const jobapplicantnumber = "applicant";
//       const id = Math.floor(Math.random() * 900000) + 1000;
//       const ext = path.extname(file.originalname);
//       const filename = `${jobapplicantnumber}__${id}${ext}`;
//       cb(null, filename);
//     } catch (error) {
//       cb(error);
//     }
//   },
// });

// const pdfUpload = multer({
//   storage: pdfStorage,
//   fileFilter: (req, file, cb) => checkPdfFileType(file, cb),
// }).single("pdf");

// const pdfuploadRouter = Router();

// pdfuploadRouter.post("/:id", async (req, res) => {
//   const jobapplicantid = req.params.id.trim();

//   if (!mongoose.Types.ObjectId.isValid(jobapplicantid)) {
//     return errorResponse(res, 400, "Invalid product ID");
//   }

//   const jobapplicantexist = await jobapplicantmodel.findById(jobapplicantid);

//   if (!jobapplicantexist) {
//     return errorResponse(res, 404, "job applicants not found");
//   }

//   pdfUpload(req, res, async (err) => {
//     if (err) {
//       return errorResponse(res, 400, err.message || "Upload error");
//     }

//     if (!req.file) {
//       return errorResponse(res, 400, "No PDF file was uploaded.");
//     }

//     try {
//       const pdfFile = req.file.filename;
//       const jobapplicant = await jobapplicantmodel.findByIdAndUpdate(
//         jobapplicantid,
//         { pdf: pdfFile },
//         { new: true }
//       );

//       return successResponse(res, "PDF uploaded successfully", jobapplicant);
//     } catch (error) {
//       console.log("Error:", error.message);
//       return errorResponse(res, 500, "Internal server error");
//     }
//   });
// });

// export default pdfuploadRouter;

import { Router } from "express";
import multer from "multer";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import dotenv from "dotenv";
import getnumber from "../../helpers/helperFunction.js";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TEMP storage for multer (just during upload)
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, "../../temp");
    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },
  //   filename: async (req, file, cb) => {
  //     try {
  //       const pid = req.params.id;
  //       const pdfnumber = await getnumber(pid);
  //       const id = Math.floor(Math.random() * 900000) + 1000;
  //       const ext = path.extname(file.originalname);
  //       const filename = `${pdfnumber}__${id}${ext}`;
  //       cb(null, filename);
  //     } catch (error) {
  //       cb(error);
  //     }
  //   },
  // });
  filename: async (req, file, cb) => {
    try {
      const pid = req.params.id;
      // Get applicant details from DB
      const applicant = await jobapplicantmodel.findById(pid);
      const fullName = applicant?.fullname || "Applicant";
      // Clean name (remove spaces and symbols)
      const cleanName = fullName.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
      const pdfnumber = await getnumber(pid);
      const id = Math.floor(Math.random() * 900000) + 1000;
      const ext = path.extname(file.originalname);

      // Final filename
      const filename = `${cleanName}_${pdfnumber}__${id}${ext}`;

      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  },
});
function checkPdfFileType(file, cb) {
  const filetypes = /\.(pdf|doc|docx)$/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];
  const mimetype = allowedMimes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF and Word documents (.doc, .docx) are allowed"));
  }
}

const upload = multer({
  storage: tempStorage,
  fileFilter: (req, file, cb) => {
    checkPdfFileType(file, cb);
  },
}).single("pdf");

// Google Drive setup
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

oAuth2Client.setCredentials(JSON.parse(fs.readFileSync("token.json")));

const drive = google.drive({ version: "v3", auth: oAuth2Client });

const cvpdfRouter = Router();

cvpdfRouter.post("/:id", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || "Upload error");
    }

    if (!req.file) {
      return errorResponse(res, 400, "No file was uploaded");
    }

    const tempFilePath = req.file.path;

    try {
      // 1. Find applicant
      const applicant = await jobapplicantmodel.findById(req.params.id);
      if (!applicant) {
        fs.unlinkSync(tempFilePath);
        return errorResponse(res, 404, "Applicant not found");
      }

      // 2. Create/find Google Drive folder
      const folderName = "firstclusiveJobApplicantsResume";
      const folderList = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id)",
      });

      let folderId;
      if (folderList.data.files.length > 0) {
        folderId = folderList.data.files[0].id;
      } else {
        const folder = await drive.files.create({
          resource: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
          },
          fields: "id",
        });
        folderId = folder.data.id;
      }

      // 3. Set metadata with folder ID
      const fileMeta = {
        name: req.file.filename,
        parents: [folderId],
      };

      const media = {
        mimeType: "application/pdf",
        body: fs.createReadStream(tempFilePath),
      };

      // 4. Upload to Drive
      const uploaded = await drive.files.create({
        resource: fileMeta,
        media: media,
        fields: "id, webViewLink",
      });

      // 5. Make file public
      await drive.permissions.create({
        fileId: uploaded.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      const publicUrl = uploaded.data.webViewLink;

      // 6. Save to MongoDB
      applicant.resume = publicUrl;
      await applicant.save();

      fs.unlinkSync(tempFilePath);
      successResponse(res, "Resume uploaded to Google Drive", applicant);
    } catch (error) {
      console.log("Upload error:", error);
      errorResponse(res, 500, "Internal server error during upload");
    }
  });
});

export default cvpdfRouter;

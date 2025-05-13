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
import mongoose from "mongoose";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate PDF file type
function checkPdfFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Error: Only PDF files are allowed!"));
  }
}

// Storage for single PDF
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../pdfs");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: async (req, file, cb) => {
    try {
      const jid = req.params.id;
      const jobapplicantnumber = await getnumber(jid);
      // const jobapplicantnumber = "applicant";
      const id = Math.floor(Math.random() * 900000) + 1000;
      const ext = path.extname(file.originalname);
      const filename = `${jobapplicantnumber}__${id}${ext}`;
      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  },
});

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => checkPdfFileType(file, cb),
}).single("pdf");

const pdfuploadRouter = Router();

pdfuploadRouter.post("/:id", async (req, res) => {
  const jobapplicantid = req.params.id.trim();
  console.log("jobapplicantid", jobapplicantid);
  if (!mongoose.Types.ObjectId.isValid(jobapplicantid)) {
    return errorResponse(res, 400, "Invalid product ID");
  }

  const jobapplicantexist = await jobapplicantmodel.findById(jobapplicantid);
  console.log("jobapplicantexist", jobapplicantexist);
  if (!jobapplicantexist) {
    return errorResponse(res, 404, "job applicants not found");
  }

  pdfUpload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || "Upload error");
    }

    if (!req.file) {
      return errorResponse(res, 400, "No PDF file was uploaded.");
    }

    try {
      const pdfFile = req.file.filename;
      const jobapplicant = await jobapplicantmodel.findByIdAndUpdate(
        jobapplicantid,
        { pdf: pdfFile },
        { new: true }
      );
    
      return successResponse(res, "PDF uploaded successfully", jobapplicant);
    } catch (error) {
      console.log("Error:", error.message);
      return errorResponse(res, 500, "Internal server error");
    }
  });
});

export default pdfuploadRouter;

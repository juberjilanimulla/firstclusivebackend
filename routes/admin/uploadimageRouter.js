import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import getnumber from "../../helpers/helperFunction.js";
import fs from "fs";
import mongoose from "mongoose";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import teamModel from "../../models/teammodel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the checkFileType function
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
}

// Configure multer for single file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: async (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const pid = req.params.id;
    const productnumber = await getnumber(pid); // Generate product number
    const id = Math.floor(Math.random() * 900000) + 1000; // Generate random ID
    const filename = `${productnumber}__${id}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("profileimg"); // Single image upload

const imgprofileuploadRouter = Router();

imgprofileuploadRouter.post("/:id", async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || "Upload error");
    }

    if (!req.file) {
      return errorResponse(res, 400, "No file was uploaded.");
    }

    try {
      const teamId = req.params.id.trim();

      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return errorResponse(res, 400, "Invalid team ID");
      }

      const filename = req.file.filename; // Get the uploaded filename

      const team = await teamModel.findByIdAndUpdate(
        teamId,
        { profileimg: filename }, // Update the profile image field
        { new: true }
      );

      if (!team) {
        return errorResponse(res, 404, "Team not found");
      }

      return successResponse(res, "Image successfully uploaded", team);
    } catch (error) {
      console.error("Error:", error.message);
      return errorResponse(res, 500, "Internal server error");
    }
  });
});

export default imgprofileuploadRouter;

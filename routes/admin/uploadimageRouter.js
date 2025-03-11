import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getnumber } from "../../helpers/helperFunction.js";
import fs from "fs";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "../../helpers/serverResponse.js";
import teamModel from "../../models/teammodel.js";
import sharp from "sharp";

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
  

const storage = multer.memoryStorage();
// Configure multer for single file upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("profileimg"); // Change to single image upload

const imgprofileuploadRouter = Router();

imgprofileuploadRouter.post("/:id", async (req, res) => {
  // Use upload middleware
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
      const buffer = await sharp(req.file.buffer).resize(350, 500).toBuffer();

      // Create the upload path if it doesn't exist
      const uploadPath = path.join(__dirname, "../../../uploads");
      fs.mkdirSync(uploadPath, { recursive: true });
      const ext = path.extname(req.file.originalname).toLowerCase();
      const pid = req.params.id;
      const productnumber = await getnumber(pid);
      const id = Math.floor(Math.random() * 900000) + 1000;

      const filename = `${productnumber}__${id}${ext}`;
      const filePath = path.join(uploadPath, filename);

      // Write the buffer to a file
      fs.writeFileSync(filePath, buffer);

      const team = await teamModel.findByIdAndUpdate(
        teamId,
        { profileimg: filename }, // Update the course image field
        { new: true }
      );
   
      return successResponse(res, "Image successfully uploaded", team);
    } catch (error) {
      console.error("Error:", error.message);
      return errorResponse(res, 500, "Internal server error");
    }
  });
});

export default imgprofileuploadRouter;

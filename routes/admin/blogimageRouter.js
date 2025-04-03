import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import mongoose from "mongoose";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogsmodel from "../../models/blogsmodel.js";
import getnumber from "../../helpers/helperFunction.js";

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

// Configure multer for direct file upload
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
}).single("coverimage");

const coverimageuploadRouter = Router();

coverimageuploadRouter.post("/:id", async (req, res) => {
  // Use upload middleware
  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || "Upload error");
    }

    if (!req.file) {
      return errorResponse(res, 400, "No file was uploaded.");
    }

    try {
      const blogid = req.params.id.trim();

      if (!mongoose.Types.ObjectId.isValid(blogid)) {
        return errorResponse(res, 400, "Invalid blog ID");
      }

      const filename = req.file.filename;

      const blog = await blogsmodel.findByIdAndUpdate(
        blogid,
        { coverimage: filename }, // Update the coverimage field in the blog
        { new: true }
      );

      if (!blog) {
        return errorResponse(res, 404, "Blog not found");
      }

      return successResponse(res, "Image successfully uploaded", blog);
    } catch (error) {
      console.error("Error:", error.message);
      return errorResponse(res, 500, "Internal server error");
    }
  });
});

export default coverimageuploadRouter;

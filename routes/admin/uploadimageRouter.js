// import { Router } from "express";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import getnumber from "../../helpers/helperFunction.js";
// import fs from "fs";
// import mongoose from "mongoose";
// import {
//   errorResponse,
//   successResponse,
// } from "../../helpers/serverResponse.js";
// import teamModel from "../../models/teammodel.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Define the checkFileType function
// function checkFileType(file, cb) {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error("Error: Images Only!"));
//   }
// }

// // Configure multer for single file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "../../uploads");
//     fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
//     cb(null, uploadPath);
//   },
//   filename: async (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     const pid = req.params.id;
//     const productnumber = await getnumber(pid); // Generate product number
//     const id = Math.floor(Math.random() * 900000) + 1000; // Generate random ID
//     const filename = `${productnumber}__${id}${ext}`;
//     cb(null, filename);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   },
// }).single("profileimg"); // Single image upload

// const imgprofileuploadRouter = Router();

// imgprofileuploadRouter.post("/:id", async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return errorResponse(res, 400, err.message || "Upload error");
//     }

//     if (!req.file) {
//       return errorResponse(res, 400, "No file was uploaded.");
//     }

//     try {
//       const teamId = req.params.id.trim();

//       if (!mongoose.Types.ObjectId.isValid(teamId)) {
//         return errorResponse(res, 400, "Invalid team ID");
//       }

//       const filename = req.file.filename; // Get the uploaded filename

//       const team = await teamModel.findByIdAndUpdate(
//         teamId,
//         { profileimg: filename }, // Update the profile image field
//         { new: true }
//       );

//       if (!team) {
//         return errorResponse(res, 404, "Team not found");
//       }

//       return successResponse(res, "Image successfully uploaded", team);
//     } catch (error) {
//       console.error("Error:", error.message);
//       return errorResponse(res, 500, "Internal server error");
//     }
//   });
// });

// export default imgprofileuploadRouter;
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mongoose from "mongoose";
import getnumber from "../../helpers/helperFunction.js";
import teamModel from "../../models/teammodel.js";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Image type check
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype.toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error("Only image files (.jpg, .jpeg, .png, .webp) are allowed"));
}

// Multer temp upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../temp");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: async (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const pid = req.params.id;
    const productnumber = await getnumber(pid);
    const id = Math.floor(Math.random() * 900000) + 1000;
    const filename = `${productnumber}__${id}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("profileimg");

const imgprofileuploadRouter = Router();

imgprofileuploadRouter.post("/:id", async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || "Upload error");
    if (!req.file) return errorResponse(res, 400, "No file was uploaded");

    const teamId = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
      return errorResponse(res, 400, "Invalid team ID");
    }

    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "FirstclusiveTeamImages",
      });

      // Delete temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch {}

      // Save public URL in MongoDB
      const team = await teamModel.findByIdAndUpdate(
        teamId,
        { profileimg: uploadResult.secure_url },
        { new: true }
      );

      if (!team) return errorResponse(res, 404, "Team not found");

      return successResponse(res, "Image uploaded to Cloudinary", team);
    } catch (error) {
      console.error("Upload error:", error.message);
      return errorResponse(res, 500, "Internal server error during upload");
    }
  });
});

export default imgprofileuploadRouter;

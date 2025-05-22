import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import teamModel from "../../models/teammodel.js";
import imgprofileuploadRouter from "./uploadimageRouter.js";
import { google } from "googleapis";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const adminteamRouter = Router();

adminteamRouter.post("/getall", getteamHandler);
adminteamRouter.post("/create", createteamHandler);
adminteamRouter.use("/uploadimage", imgprofileuploadRouter);
adminteamRouter.post("/update", updateteamHandler);
adminteamRouter.post("/delete", deleteteamHandler);
adminteamRouter.get("/single", getsingleteamHandler);
adminteamRouter.post("/delete/profileimg", deleteprofileimgHandler);
export default adminteamRouter;

const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const token = JSON.parse(fs.readFileSync("token.json"));

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);
oAuth2Client.setCredentials(token);

const drive = google.drive({ version: "v3", auth: oAuth2Client });

// async function getteamHandler(req,res){
//     try {
//         const team = await teamModel.find();
//        successResponse(res,"success",team)
//     } catch (error) {
//         console.log("error",error);
//         errorResponse(res,500,"internal server error")
//     }
// }
async function getteamHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, search = "" } = req.body;

    const limit = 20; // Number of items per page
    const skip = pageno * limit;

    // Base query for teams
    let matchQuery = {};

    // Apply filters
    if (filterBy) {
      Object.keys(filterBy).forEach((key) => {
        if (filterBy[key] !== undefined) {
          matchQuery[key] = filterBy[key];
        }
      });
    }

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      const searchFields = [
        "firstName",
        "lastName",
        "email",
        "description",
        "role",
      ]; // Adjust based on team schema fields
      const searchConditions = searchFields.map((field) => ({
        [field]: { $regex: searchRegex },
      }));

      matchQuery.$or = searchConditions;
    }

    // Fetch total count for pagination
    const totalCount = await teamModel.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    // Aggregation Pipeline
    const teams = await teamModel.aggregate([
      { $match: matchQuery }, // Apply filters

      {
        $addFields: {
          normalizedRole: {
            $toLower: { $trim: { input: "$role" } },
          },
        },
      },

      {
        $addFields: {
          rolePriority: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$normalizedRole", "managing director"] },
                  then: 1,
                },
                { case: { $eq: ["$normalizedRole", "director"] }, then: 2 },
                { case: { $eq: ["$normalizedRole", "hr manager"] }, then: 3 },
                { case: { $eq: ["$normalizedRole", "manager"] }, then: 4 },
              ],
              default: 5, // All other roles
            },
          },
        },
      },

      { $sort: { rolePriority: 1, createdAt: -1 } }, // Sort by priority, then by latest
      { $skip: skip },
      { $limit: limit },
      { $project: { normalizedRole: 0, rolePriority: 0 } }, // Clean up extra fields
    ]);

    successResponse(res, "Success", { teams, totalPages });
  } catch (error) {
    console.error("Error:", error);
    errorResponse(res, 500, "Internal server error");
  }
}

async function createteamHandler(req, res) {
  try {
    const { firstName, lastName, email, mobile, role, description, message } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !role ||
      !description ||
      !message
    ) {
      return errorResponse(res, 400, "some params are missing");
    }
    const team = await teamModel.create({
      firstName,
      lastName,
      email,
      mobile,
      role,
      description,
      message,
    });
    if (!team) {
      return errorResponse(res, 404, "some error while creating");
    }
    successResponse(res, "success", team);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateteamHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.firstName ||
      !updatedData.lastName ||
      !updatedData.email ||
      !updatedData.mobile ||
      !updatedData.role ||
      !updatedData.description ||
      !updatedData.message
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const updated = await teamModel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );

    successResponse(res, "success Updated", updated);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteteamHandler(req, res) {
  try {
    const { _id } = req.body;

    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }

    // Find team first (to access profileimg URL before deletion)
    const team = await teamModel.findById(_id);
    if (!team) {
      return errorResponse(res, 404, "team id not found");
    }

    const profileImgUrl = team.profileimg;
    const match = profileImgUrl?.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)/);
    const fileId = match ? match[1] : null;

    if (fileId) {
      try {
        await cloudinary.uploader.destroy(fileId);
        console.log("cloudinary image deleted:", fileId);
      } catch (err) {
        console.warn(
          "Failed to delete profile image from cloudinary:",
          err.message
        );
      }
    }

    // Now delete the team from MongoDB
    await teamModel.findByIdAndDelete(_id);

    successResponse(res, "Team and profile image successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getsingleteamHandler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return errorResponse(res, 404, "some params are missing");
    }
    const data = await teamModel.findById(id).select(" -_id");
    if (!data) {
      return errorResponse(res, 404, "id not found");
    }
    successResponse(res, "Success", data);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteprofileimgHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "Team ID is required");
    }

    const team = await teamModel.findById(_id);
    if (!team) {
      return errorResponse(res, 404, "Team not found");
    }

    const profileImgUrl = team.profileimg;
    const match = profileImgUrl?.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)/);
    const fileId = match ? match[1] : null;

    if (fileId) {
      try {
        await cloudinary.uploader.destroy(fileId);
        console.log("cloudinary image deleted:", fileId);
      } catch (err) {
        console.warn(
          "Failed to delete profile image from cloudinary:",
          err.message
        );
      }
    }

    // Clear the profile image URL in the DB
    team.profileimg = "";
    await team.save();

    return successResponse(res, "Team image deleted successfully", team);
  } catch (error) {
    console.error("error", error);
    return errorResponse(res, 500, "Internal server error");
  }
}

import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import teamModel from "../../models/teammodel.js";
import imgprofileuploadRouter from "./uploadimageRouter.js";

const adminteamRouter = Router();

adminteamRouter.post("/getall", getteamHandler);
adminteamRouter.post("/create", createteamHandler);
adminteamRouter.use("/uploadimage", imgprofileuploadRouter);
adminteamRouter.post("/update", updateteamHandler);
adminteamRouter.post("/delete", deleteteamHandler);
adminteamRouter.get("/single", getsingleteamHandler);

export default adminteamRouter;

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
    const team = await teamModel.findByIdAndDelete({ _id: _id });
    if (!team) {
      return errorResponse(res, 404, "team id not found");
    }
    successResponse(res, "Success");
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

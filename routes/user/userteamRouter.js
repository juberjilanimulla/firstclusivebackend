import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import teamModel from "../../models/teammodel.js";

const userteamRouter = Router();

userteamRouter.get("/", getallteamHandler);

export default userteamRouter;

async function getallteamHandler(req, res) {
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
                {
                  case: { $eq: ["$normalizedRole", "executive director"] },
                  then: 3,
                }, // Added this
                { case: { $eq: ["$normalizedRole", "hr manager"] }, then: 4 },
                { case: { $eq: ["$normalizedRole", "manager"] }, then: 5 },
              ],
              default: 6, // All other roles
            },
          },
        },
      },

      { $sort: { rolePriority: 1, createdAt: 1 } }, // Sort by priority, then by latest
      { $skip: skip },
      { $limit: limit },
      { $project: { normalizedRole: 0, rolePriority: 0 } }, // Clean up extra fields
    ]);

    successResponse(res, "Success", { teams, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import commentmodel from "../../models/commentmodel.js";

const commentRouter = Router();

commentRouter.post("/getall", getcommentHandler);
commentRouter.post("/create", createcommentHandler);
commentRouter.post("/delete", deletecommentHandler);
export default commentRouter;

async function createcommentHandler(req, res) {
  try {
    const { blogid, name, email, mobile, message } = req.body;
    if (!blogid || !name || !email || !message) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { blogid, name, email, mobile, message };
    const comment = await commentmodel.create(params);
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getcommentHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = { approved: true };

    // Apply filters
    if (filterBy) {
      Object.keys(filterBy).forEach((key) => {
        if (filterBy[key] !== undefined) {
          query.$and.push({ [key]: filterBy[key] });
        }
      });
    }

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp("\\b" + search.trim(), "i");
      const searchConditions = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
      ];
      query.$and.push({ $or: searchConditions });
    }

    // Apply sorting
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 };

    // Aggregation pipeline with pagination
    const comments = await commentmodel.aggregate([
      { $match: query },
      {
        $project: {
          blogid: 1,
          name: 1,
          email: 1,
          mobile: 1,
          message: 1,
          createdAt: 1,
          approved: 1,
        },
      },
      { $sort: sortBy },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count for pagination
    const totalCount = await commentmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "Success", { comments, totalPages });
  } catch (error) {
    console.error("Error fetching comments:", error);
    errorResponse(res, 500, "Internal server error");
  }
}

async function deletecommentHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const comment = await commentmodel.findByIdAndDelete({ _id: _id });
    if (!comment) {
      return errorResponse(res, 404, "comment id not found");
    }
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
  }
}

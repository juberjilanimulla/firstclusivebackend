import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import commentmodel from "../../models/commentmodel.js";

const admincommentRouter = Router();

admincommentRouter.post("/getall", getcommentHandler);
admincommentRouter.post("/published/:id", publishedapprovalHandler);
admincommentRouter.delete("/delete", deletecommitHandler);

export default admincommentRouter;

async function getcommentHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = { $and: [] };

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
        { "blog.title": { $regex: searchRegex } },
      ];
      query.$and.push({ $or: searchConditions });
    }

    if (query.$and.length === 0) {
      query = {};
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
      {
        $lookup: {
          from: "blogs",
          localField: "blogid",
          foreignField: "_id",
          as: "blog",
        },
      },
      { $unwind: "$blog" },
      { $match: query },
      {
        $project: {
          blogid: 1,
          blogtitle: "$blog.title",
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

async function publishedapprovalHandler(req, res) {
  try {
    const commentid = req.params.id;
    const { approved } = req.body;

    if (typeof approved !== "boolean") {
      return errorResponse(res, 400, "Invalid approved status");
    }
    const updatedComment = await commentmodel.findByIdAndUpdate(
      commentid,
      { approved },
      { new: true }
    );

    if (!updatedComment) {
      return errorResponse(res, 404, "Comment not found");
    }
    return successResponse(res, "success", updatedComment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletecommitHandler(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const comment = await commentmodel.findByIdAndDelete({ _id: id });
    if (!comment) {
      return errorResponse(res, 404, "comment id not found");
    }
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

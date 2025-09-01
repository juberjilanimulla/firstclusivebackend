import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const adminjobapplicantsRouter = Router();

adminjobapplicantsRouter.post("/getall", getalljobapplicantsHandler);
adminjobapplicantsRouter.post("/delete", deletejobapplicantsHandler);

export default adminjobapplicantsRouter;

async function getalljobapplicantsHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;

    const limit = 10; // Number of items per page
    const skip = pageno * limit;

    // Base query for job applicants
    let query = {
      $and: [],
    };

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
      // const searchRegex = new RegExp(search.trim(), "i");
      const searchRegex = new RegExp("\\b" + search.trim(), "i");
      const searchConditions = [
        { fullname: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { "jobs.jobtitle": { $regex: searchRegex } },
      ];
      query.$and.push({ $or: searchConditions });
    }

    // If no filters or search applied, use an empty object for the query
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
        : { createdAt: -1 }; // Default sorting by most recent applications

    // Aggregation pipeline
    const applicants = await jobapplicantmodel.aggregate([
      {
        $lookup: {
          from: "jobpostings",
          localField: "jobid",
          foreignField: "_id",
          as: "jobs",
        },
      },
      {
        $unwind: "$jobs",
      },
      {
        $match: query,
      },
      {
        $project: {
          jobtitle: "$jobs.jobtitle",
          location: "$jobs.location",
          fullname: 1,
          email: 1,
          contact: 1,
          pdf: 1,
          yearofexperience: 1,
          createdAt: 1,
          currentctc: 1,
          expectedctc: 1,
          linkedinurl: 1,
        },
      },
      { $sort: sortBy },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Fetch total count for pagination
    const totalCount = await jobapplicantmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Respond with data
    successResponse(res, "Success", { applicants, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletejobapplicantsHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const jobapplicants = await jobapplicantmodel.findByIdAndDelete({
      _id: _id,
    });
    if (!jobapplicants) {
      return errorResponse(res, 404, "jobapplicants id not found");
    }

    const s3Key = jobapplicants.pdf?.split(".amazonaws.com/")[1];

    if (s3Key) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        })
      );
    }

    // Delete blog from DB
    await blogmodel.findByIdAndDelete(_id);
    return successResponse(res, "job appolicants and associated pdf deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

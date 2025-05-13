import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import cvpdfRouter from "./uploadcv.js";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";
import jobpostingmodel from "../../models/jobpostingmodel.js";

const jobapplicantRouter = Router();

jobapplicantRouter.post("/create", createjobapplicantsHandler);
jobapplicantRouter.use("/uploadcv", cvpdfRouter);

export default jobapplicantRouter;

async function createjobapplicantsHandler(req, res) {
  try {
    const { jobid, fullname, email, contact, yearofexperience, termsaccepted } =
      req.body;
    if (!jobid || !fullname || !email || !contact || !yearofexperience) {
      return errorResponse(res, 400, "some params are missing");
    }

    const jobExists = await jobpostingmodel.findById({ _id: jobid });
    if (!jobExists) {
      return errorResponse(res, 404, "Job ID does not exist");
    }

    // Check if user already applied for the same job
    const alreadyApplied = await jobapplicantmodel.findOne({ jobid, email });
    if (alreadyApplied) {
      return errorResponse(res, 400, "You have already applied for this job");
    }

    const jobapplicant = await jobapplicantmodel.create({
      jobid,
      fullname,
      email,
      contact,
      yearofexperience,
      termsaccepted,
    });
    successResponse(res, "success", jobapplicant);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

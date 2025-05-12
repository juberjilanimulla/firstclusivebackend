import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";

import cvpdfRouter from "./uploadcv.js";
import jobapplicantmodel from "../../models/jobapplicantsmodel.js";

const careerRouter = Router();

careerRouter.post("/create", createcareerHandler);
careerRouter.use("/uploadcv", cvpdfRouter);
export default careerRouter;

async function createcareerHandler(req, res) {
  try {
    const { jobid, fullname, email, contact, yearofexperience } = req.body;
    if (!jobid || !fullname || !email || !contact || !yearofexperience) {
      return errorResponse(res, 400, "some params are missing");
    }

    const existingCareer = await careermodel.findOne({ email });
    if (existingCareer) {
      return errorResponse(res, 400, "You have already submitted the form");
    }

    const career = await jobapplicantmodel.create({
      jobid,
      fullname,
      email,
      contact,
      yearofexperience,
      termsaccepted,
    });
    successResponse(res, "success", career);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

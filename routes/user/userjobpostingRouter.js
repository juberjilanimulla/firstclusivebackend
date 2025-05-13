import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import jobpostingmodel from "../../models/jobpostingmodel.js";

const userjobpostingRouter = Router();

userjobpostingRouter.get("/getall", getalljobpostingHandler);

export default userjobpostingRouter;

async function getalljobpostingHandler(req, res) {
  try {
    const jobposting = await jobpostingmodel.find();
    successResponse(res, "success", jobposting);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

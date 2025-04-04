import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import commentmodel from "../../models/commentmodel.js";

const admincommentRouter = Router();

admincommentRouter.get("/getcomment", getcommentHandler);

export default admincommentRouter;

async function getcommentHandler(req, res) {
  try {
    const comment = await commentmodel.find();
    if (!comment) {
      return errorResponse(res, 404, "comment are not found");
    }
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

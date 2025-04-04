import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import commentmodel from "../../models/commentmodel.js";

const commentRouter = Router();

commentRouter.post("/create", createcommentHandler);
export default commentRouter;

async function createcommentHandler(req, res) {
  try {
    const { blogid, name, email, mobile } = req.body;
    if (!blogid || !name || !email) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { blogid, name, email, mobile };
    const comment = await commentmodel.create(params);
    successResponse(res, "success", comment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}



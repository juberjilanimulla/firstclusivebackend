import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogsmodel from "../../models/blogsmodel.js";

const userblogRouter = Router();
userblogRouter.get("/getall", getallblogHandler);
export default userblogRouter;

async function getallblogHandler(req, res) {
  try {
    const blog = await blogsmodel.find({ published: true });
    successResponse(res, "Success", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

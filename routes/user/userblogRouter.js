import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogsmodel from "../../models/blogsmodel.js";

const userblogRouter = Router();
userblogRouter.get("/getall", getallblogHandler);
userblogRouter.get("/single/:id", getsingleblogHandler);
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

async function getsingleblogHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const blog = await blogsmodel.findById(id);
    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }
    successResponse(res, "success", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

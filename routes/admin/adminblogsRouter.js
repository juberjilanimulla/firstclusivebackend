import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogsmodel from "../../models/blogsmodel.js";

const adminblogRouter = Router();

adminblogRouter.get("/getall", getallblogsHandler);
adminblogRouter.post("/create", createblogsHandler);
adminblogRouter.post("/update", updateblogsHandler);
adminblogRouter.post("/delete", deleteblogsHandler);

export default adminblogRouter;

async function getallblogsHandler(req, res) {
  try {
    const blogs = await blogsmodel.find();
    successResponse(res, "Success", blogs);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createblogsHandler(req, res) {
  try {
    const { title, metatitle, metadescription, keywords, content } = req.body;
    if (!title || !metatitle || !metadescription || !keywords || !content) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = {
      title,
      metatitle,
      metadescription,
      keywords,
      content,
    };
    const blog = await blogsmodel.create(params);
    console.log("blog", blog);
    if (!blog) {
      return errorResponse(res, 404, "blogs are not created");
    }
    successResponse(res, "blog created successfully", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateblogsHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteblogsHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

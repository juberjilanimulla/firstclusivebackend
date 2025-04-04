import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogsmodel from "../../models/blogsmodel.js";
import coverimageuploadRouter from "./blogimageRouter.js";

const adminblogRouter = Router();

adminblogRouter.post("/", getallblogsHandler);
adminblogRouter.post("/create", createblogHandler);
adminblogRouter.post("/update", updateblogsHandler);
adminblogRouter.post("/delete", deleteblogsHandler);
adminblogRouter.post("/singleblog", getsingleblogsHandler);
adminblogRouter.post("/published/:id", publishedapprovalHandler);

adminblogRouter.use("/blogimage", coverimageuploadRouter);
export default adminblogRouter;

async function getallblogsHandler(req, res) {
  try {
    const blog = await blogsmodel.find();
    successResponse(res, "success", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createblogHandler(req, res) {
  try {
    const { title, metatitle, metadescription, keywords, content, published } =
      req.body;
    if (!title || !metatitle || !metadescription || !keywords || !content) {
      return errorResponse(res, 400, "some params are missing");
    }
    const parmas = {
      title,
      metatitle,
      metadescription,
      keywords,
      content,
      published: true,
    };
    const blog = await blogsmodel.create(parmas);
    successResponse(res, "successfully updated", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateblogsHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.title ||
      !updatedData.metatitle ||
      !updatedData.metadescription ||
      !updatedData.keywords ||
      !updatedData.content
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const blog = await blogsmodel.findByIdAndUpdate(_id, updatedData, options);
    successResponse(res, "successfully updated", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteblogsHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const blog = await blogsmodel.findByIdAndDelete({ _id: _id });
    if (!blog) {
      return errorResponse(res, 404, "blog id not found");
    }
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getsingleblogsHandler(req, res) {
  try {
    const { _id } = req.body;

    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const blog = await blogsmodel.findById(_id);
    successResponse(res, "success", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function publishedapprovalHandler(req, res) {
  try {
    const { publishedid } = req.params;
    const { published } = req.body;
    if (typeof published !== "boolean") {
      return errorResponse(res, 400, "Invalid published status");
    }

    const updatedBlog = await jobpostingmodel.findByIdAndUpdate(
      publishedid,
      { published },
      { new: true }
    );
    if (!updatedBlog) {
      return errorResponse(res, 404, "blog not found");
    }

    successResponse(
      res,
      "blog post  approval status updated successfully",
      updatedBlog
    );
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

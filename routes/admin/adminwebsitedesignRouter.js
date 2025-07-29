import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import websitedesignmodel from "../../models/websitedesignmodel.js";

const adminwebsitedesignRouter = Router();

adminwebsitedesignRouter.post("/", getwebsitedesignHandler);
adminwebsitedesignRouter.delete("/delete", deletewebsitedesignHandler);

export default adminwebsitedesignRouter;

async function getwebsitedesignHandler(req, res) {
  try {
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletewebsitedesignHandler(req, res) {
  try {
    const { _id } = req.body;
    if (_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const websitedesign = await websitedesignmodel.findByIdAndDelete({ _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

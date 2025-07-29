import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import websitedesignmodel from "../../models/websitedesignmodel.js";

const userwebsitedesignRouter = Router();

userwebsitedesignRouter.post("/create", createwebsitedesignHandler);

export default userwebsitedesignRouter;

async function createwebsitedesignHandler(req, res) {
  try {
    const { name, type, paymentgateway } = req.body;
    if (!name || !type || !paymentgateway) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { name, type, paymentgateway };
    const websitedesign = await websitedesignmodel.create(params);
    successResponse(res, "successfully created", websitedesign);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

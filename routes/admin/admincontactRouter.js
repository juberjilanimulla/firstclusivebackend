import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import contactmodel from "../../models/contactmodel.js";

const admincontactRouter = Router();

export default admincontactRouter;

admincontactRouter.get("/getall", getallcontactHandler);
admincontactRouter.get("/:id", getsinglecontactHandler);
admincontactRouter.get("/delete/:id", deletecontactHandler);

async function getallcontactHandler(req, res) {
  try {
    const contact = await contactmodel.find();
    if (!contact) {
      return errorResponse(res, 404, "contact are not present in the database");
    }
    successResponse(res, "success", contact);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getsinglecontactHandler(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const contact = await contactmodel.findById({ _id: id });
    if (!contact) {
      return errorResponse(res, 404, "contact id not found");
    }
    successResponse(res, "success", contact);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletecontactHandler(req, res) {
  try {
    const { id } = req.param.id;
    if (!id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const contact = await contactmodel.findByIdAndDelete({ _id: id });
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

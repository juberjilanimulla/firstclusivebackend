import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import servicemodel from "../../models/servicesmodel.js";

const adminserviceRouter = Router();

adminserviceRouter.post("/", getallserviceHandler);
adminserviceRouter.post("/create", createserviceHandler);
adminserviceRouter.put("/update", updateserviceHandler);
adminserviceRouter.delete("/delete", deleteserviceHandler);

export default adminserviceRouter;

async function getallserviceHandler(req, res) {
  try {
    const service = await servicemodel.find().sort({ createdAt: -1 });
    successResponse(res, "success", service);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createserviceHandler(req, res) {
  try {
    const { servicename, servicecost, gstcost, totalamount } = req.body;
    if (!servicename || !servicecost || !gstcost || !totalamount) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { servicename, servicecost, gstcost, totalamount };
    const service = await servicemodel.create(params);
    successResponse(res, "success", service);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateserviceHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.servicename ||
      !updatedData.servicecost ||
      !updatedData.gstcost ||
      !updatedData.totalamount
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const service = await servicemodel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );
    successResponse(res, "successfully updated", service);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteserviceHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const service = await servicemodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

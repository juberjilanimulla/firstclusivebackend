import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import billingmodel from "../../models/billingmodel.js";

const userbillingRouter = Router();

userbillingRouter.post("/create", createbillingHandler);

export default userbillingRouter;

async function createbillingHandler(req, res) {
  try {
    const { serviceid, name, email, mobile, state } = req.body;
    if (!serviceid || !name || !email || !mobile || !state) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { serviceid, name, email, mobile, state };
    const billing = await billingmodel.create(params);
    successResponse(res, "success", billing);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

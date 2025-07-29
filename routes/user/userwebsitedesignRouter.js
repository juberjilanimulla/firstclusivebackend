import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import websitedesignmodel from "../../models/websitedesignmodel.js";

const userwebsitedesignRouter = Router();

userwebsitedesignRouter.get("/check/", getwebsitedesigncheckHandler);
userwebsitedesignRouter.post("/create", createwebsitedesignHandler);

export default userwebsitedesignRouter;

async function createwebsitedesignHandler(req, res) {
  try {
    const {
      paymentid,
      name,
      email,
      mobile,
      address,
      companyname,
      tagline,
      whichindustryareyou,
      businessdo,
      maincustomers,
      websitetofeel,
      coloursprefer,
      coloursavoid,
      referencesites,
      specificidea,
      likeustoknow,
    } = req.body;
    if (!paymentid || !name || !email || !mobile) {
      return errorResponse(res, 400, "some params are missing");
    }

    const payment = await paymentmodel.findById(paymentid);

    if (
      !payment ||
      !payment.razorpay_payment_id ||
      !payment.status === "completed"
    ) {
      return errorResponse(res, 403, "Payment not completed");
    }

    const formalready = await websitedesignmodel.findOne({ paymentid });

    if (formalready) {
      return errorResponse(res, 403, "Form already submitted");
    }
    const params = {
      paymentid,
      name,
      email,
      mobile,
      address,
      companyname,
      tagline,
      whichindustryareyou,
      businessdo,
      maincustomers,
      websitetofeel,
      coloursprefer,
      coloursavoid,
      referencesites,
      specificidea,
      likeustoknow,
    };
    const websitedesign = await websitedesignmodel.create(params);
    successResponse(res, "successfully created", websitedesign);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getwebsitedesigncheckHandler(req, res) {
  try {
    const { paymentid } = req.params;

    if (!paymentid) {
      return errorResponse(res, 400, "Payment ID is required");
    }

    // 1. Check payment exists
    const payment = await paymentmodel.findById(paymentid);
    if (!payment) {
      return errorResponse(res, 404, "Payment record not found");
    }

    // 2. Check payment status
    if (payment.status !== "completed" || !payment.razorpay_payment_id) {
      return successResponse(res, "Payment not completed", {
        status: "pending",
        message: "Please complete your payment to access the form",
      });
    }

    // 3. Check if form already submitted
    const existingForm = await websitedesignmodel.findOne({ paymentid });
    if (existingForm) {
      return successResponse(res, "Form already submitted", {
        status: "already_submitted",
        message: "Form already submitted for this payment",
      });
    }

    // 4. Allow access
    return successResponse(res, "Payment verified. You can now fill the form", {
      status: "completed",
      paymentid,
      message: "Access granted",
    });
  } catch (error) {
    console.error("Form access error:", error);
    return errorResponse(res, 500, "Internal Server Error");
  }
}

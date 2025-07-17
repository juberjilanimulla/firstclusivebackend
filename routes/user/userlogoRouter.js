import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import logomodel from "../../models/logomodel.js";
import logouploadimageRouter from "./userlogouploadRouter.js";
import paymentmodel from "../../models/paymentmodel.js";

const userlogoRouter = Router();

userlogoRouter.get("/checkpayment/:paymentid", getlogocheckHandler);
userlogoRouter.post("/create", createbusinesscardHandler);
userlogoRouter.use("/uploadlogo", logouploadimageRouter);

export default userlogoRouter;

async function createbusinesscardHandler(req, res) {
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
      brandtofeel,
      colours,
      coloursavoid,
      logodoprefer,
      specificidea,
      likeustoknow,
    } = req.body;
    if (!paymentid || !name || !email || !mobile) {
      return errorResponse(
        res,
        400,
        "Payment ID, Name, Email, Mobile are required"
      );
    }
    const payment = await paymentmodel.findById(paymentid);

    if (
      !payment ||
      !payment.razorpay_payment_id ||
      !payment.status === "completed"
    ) {
      return errorResponse(res, 403, "Payment not completed");
    }

    const formalready = await logomodel.findOne({ paymentid });

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
      brandtofeel,
      colours,
      coloursavoid,
      logodoprefer,
      specificidea,
      likeustoknow,
    };
    const businesscard = await logomodel.create(params);
    successResponse(res, "success", businesscard);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getlogocheckHandler(req, res) {
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
    const existingForm = await logomodel.findOne({ paymentid });
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

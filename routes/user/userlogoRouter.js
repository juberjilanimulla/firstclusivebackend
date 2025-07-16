import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import logomodel from "../../models/logomodel.js";
import logouploadimageRouter from "./userlogouploadRouter.js";
import paymentmodel from "../../models/paymentmodel.js";

const userlogoRouter = Router();

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

    if (!payment || !payment.razorpay_payment_id || !payment.status==="completed") {
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

import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import couponmodel from "../../models/couponmodel.js";
import paymentmodel from "../../models/paymentmodel.js";

const usercouponRouter = Router();

usercouponRouter.post("/create", createcouponHandler);

export default usercouponRouter;

async function createcouponHandler(req, res) {
  try {
    const { code, paymentid } = req.body;

    // Validate inputs
    if (!code || !paymentid) {
      return errorResponse(res, 400, "code and paymentid are required");
    }

    // Get payment/order details
    const payment = await paymentmodel.findById(paymentid);
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    const totalamount = payment.amount; // or netamount, totalamount, etc.

    // Validate coupon
    const coupon = await couponmodel.findOne({
      code: code.toLowerCase(),
      active: true,
    });
    if (!coupon) {
      return errorResponse(res, 404, "Invalid or inactive coupon code");
    }

    if (new Date() > new Date(coupon.expiresat)) {
      return errorResponse(res, 400, "Coupon has expired");
    }

    // Calculate discount
    let discountamount = 0;
    if (coupon.discounttype === "percentage") {
      discountamount = (totalamount * coupon.discountvalue) / 100;
    } else if (coupon.discounttype === "amount") {
      discountamount = coupon.discountvalue;
    }

    let finalamount = totalamount - discountamount;
    if (finalamount < 0) finalamount = 0;

    // Optional: update payment object with applied coupon
    // await paymentmodel.findByIdAndUpdate(paymentid, {
    //   coupon: coupon.code,
    //   discountamount,
    //   finalamount
    // });

    successResponse(res, "coupon applied", {
      originalAmount: totalamount,
      discountamount,
      finalamount,
      couponUsed: coupon.code,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

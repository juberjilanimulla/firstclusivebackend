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

    if (!code || !paymentid) {
      return errorResponse(res, 400, "code and paymentid are required");
    }

    // Fetch payment by ID
    const payment = await paymentmodel.findById(paymentid);

    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    const rawAmount = payment.amount; // in paise

    const totalamount = rawAmount / 100; // 747 in your case

    // Find coupon by code (case insensitive)
    const coupon = await couponmodel.findOne({
      code: { $regex: new RegExp("^" + code.trim() + "$", "i") }, // case-insensitive
      active: true,
    });

    if (!coupon) {
      return errorResponse(res, 404, "Invalid or inactive coupon code");
    }

    // Check if coupon expired
    const now = new Date();
    if (now > new Date(coupon.expiresat)) {
      return errorResponse(res, 400, "Coupon has expired");
    }

    // Calculate discount
    let discountamount = 0;
    if (coupon.discounttype === "percentage") {
      discountamount = (totalamount * coupon.discountvalue) / 100;
    } else if (coupon.discounttype === "amount") {
      discountamount = coupon.discountvalue;
    }

    // Round to 2 decimal places
    discountamount = Math.min(discountamount, totalamount);
    discountamount = Math.round(discountamount * 100) / 100;

    let finalamount = totalamount - discountamount;
    finalamount = Math.round(finalamount * 100) / 100;

    // Optional: update payment with applied coupon
    await paymentmodel.findByIdAndUpdate(paymentid, {
      couponid: coupon._id,
      discountamount,
      finalamount,
    });

    return successResponse(res, "Coupon applied successfully", {
      originalAmount: totalamount,
      discountamount,
      finalamount,
      couponUsed: coupon.code,
      discountType: coupon.discounttype,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

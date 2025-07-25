import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import couponmodel from "../../models/couponmodel.js";
import servicemodel from "../../models/servicesmodel.js";

const usercouponRouter = Router();

usercouponRouter.post("/create", createcouponHandler);
usercouponRouter.get("/", getcouponHandler);

export default usercouponRouter;

async function createcouponHandler(req, res) {
  try {
    const { code, serviceid } = req.body;

    if (!code || !serviceid) {
      return errorResponse(res, 400, "code and serviceid are required");
    }

    // service
    const service = await servicemodel.findById(serviceid);
    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    const totalamounts = service.totalamount;
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
      discountamount = (totalamounts * coupon.discountvalue) / 100;
    } else if (coupon.discounttype === "amount") {
      discountamount = coupon.discountvalue;
    }

    // Round to 2 decimal places
    discountamount = Math.min(discountamount, totalamounts);
    discountamount = Math.round(discountamount * 100) / 100;

    let finalamount = totalamounts - discountamount;
    finalamount = Math.round(finalamount * 100) / 100;

    // Optional: update payment with applied coupon


    return successResponse(res, "Coupon applied successfully", {
      originalAmount: totalamounts,
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

async function getcouponHandler(req, res) {
  try {
    const coupon = await couponmodel.find().sort({ createdAt: -1 });
    successResponse(res, "success", coupon);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

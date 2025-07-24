import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import couponmodel from "../../models/couponmodel.js";

const admincouponRouter = Router();

admincouponRouter.get("/", getallcouponHandler);
admincouponRouter.post("/create", createcouponHandler);
admincouponRouter.delete("/delete", deletecouponHandler);
admincouponRouter.post("/active", activecouponHandler);

export default admincouponRouter;

async function getallcouponHandler(req, res) {
  try {
    const coupon = await couponmodel.find().sort({ createdAt: -1 });
    successResponse(res, "success", coupon);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createcouponHandler(req, res) {
  try {
    const { code, discounttype, discountvalue, expiresat } = req.body;
    if (!code || !discounttype || !discountvalue) {
      return errorResponse(res, 400, "some params are missing");
    }
    const exist = await couponmodel.findOne({ code });
    if (exist) {
      return errorResponse(res, 400, "already code is exist");
    }
    const coupon = await couponmodel.create({
      code,
      discounttype,
      discountvalue,
      expiresat,
    });
    successResponse(res, "success", coupon);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletecouponHandler(req, res) {
  try {
    const { couponid } = req.body;
    if (!couponid) {
      return errorResponse(res, 400, "couponid param is missing");
    }
    const coupon = await couponmodel.findByIdAndDelete(couponid);
    if (!coupon) {
      return errorResponse(res, 404, "coupon is not exist");
    }
    successResponse(res, "success deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function activecouponHandler(req, res) {
  try {
    const { couponid, active } = req.body;
    if (!couponid || typeof active !== "boolean") {
      return errorResponse(res, 400, "couponid or active status missing");
    }
    const updated = await couponmodel.findByIdAndUpdate(
      couponid,
      { active },
      { new: true }
    );
    successResponse(res, "success", updated);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

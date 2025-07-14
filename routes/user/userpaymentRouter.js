import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import paymentmodel from "../../models/paymentmodel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const userpaymentRouter = Router();

userpaymentRouter.post("/create", createpaymentHandler);
userpaymentRouter.post("/verify", verifypaymentHandler);

export default userpaymentRouter;

async function createpaymentHandler(req, res) {
  try {
    const { billingid, amount, method } = req.body;
    if (!billingid || !amount || !method) {
      return errorResponse(res, 400, "some params are missing");
    }
    // Step 1: Create Razorpay Order
    const options = {
      amount: amount, // amount in paise
      currency: "INR",
      receipt: `rcpt_${billingid}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await paymentmodel.create({
      billingid,
      method,
      amount,
      status: "pending",
      paymentid: order.id,
    });
  
    successResponse(res, "order_created", {
      order_id: order.id,
      amount: order.amount,
      payment_id: payment._id,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function verifypaymentHandler(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    await paymentmodel.findOneAndUpdate(
      { paymentid: razorpay_order_id },
      { status: "completed", razorpay_payment_id }
    );
    return successResponse(res, "Payment verified");
  } else {
    console.log("Invalid signature verification failed");
    return errorResponse(res, 400, "Invalid signature");
  }
}

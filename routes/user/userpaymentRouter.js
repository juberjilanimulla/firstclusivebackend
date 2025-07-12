import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import paymentmodel from "../../models/paymentmodel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const userpaymentRouter = Router();

userpaymentRouter.post("/create", createpaymentHandler);

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
    console.log("order", order);
    const payment = await paymentmodel.create({
      billingid,
      method,
      amount,
      status: "completed",
      paymentid: order.id,
    });
    console.log("payment", payment);
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

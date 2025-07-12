import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const paymentSchema = new Schema(
  {
    billingid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bill",
    },
    amount: Number,
    method: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentid: String,
    razorpay_payment_id: String,
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

paymentSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

paymentSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const paymentmodel = model("payment", paymentSchema);
export default paymentmodel;

import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    discounttype: {
      type: String,
      enum: ["percentage", "amount"],
      required: true,
    }, // type
    discountvalue: { type: Number }, // value
    expiresat: { type: Date }, // expiration
    active: { type: Boolean, default: true }, // status
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

couponSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

couponSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});
const couponmodel = model("coupon", couponSchema);
export default couponmodel;

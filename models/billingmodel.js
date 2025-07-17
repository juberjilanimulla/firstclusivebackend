import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const billingSchema = new Schema(
  {
    serviceid: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
      },
    ],
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
    },
    state: {
      type: String,
    },
    gstin: String,
    gstname: String,
    gstaddress: String,
    gststate: String,
    termsandconditions: String,
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

billingSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

billingSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const billingmodel = model("bill", billingSchema);
export default billingmodel;

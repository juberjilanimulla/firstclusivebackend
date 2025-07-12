import { Schema, model } from "mongoose";

const serviceSchema = new Schema(
  {
    servicename: String,
    servicecost: Number,
    gstcost: Number,
    totalamount: Number,
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

serviceSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

serviceSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const servicemodel = model("service", serviceSchema);
export default servicemodel;

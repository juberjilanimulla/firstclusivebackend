import { Schema, model } from "mongoose";

const websitedesignSchema = new Schema(
  {
    name: String,
    type: String,
    paymentgateway: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true, versionKey: false }
);

const websitedesignmodel = model("websitedesign", websitedesignSchema);
export default websitedesignmodel;

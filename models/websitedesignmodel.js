import { Schema, model } from "mongoose";

const websitedesignSchema = new Schema(
  {
    paymentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    name: String,
    email: String,
    mobile: String,
    address: String,
    companyname: {
      type: String,
      default: "",
    },
    tagline: {
      type: String,
      default: "",
    },
    whichindustryareyou: {
      type: String,
      default: "",
    },
    businessdo: {
      type: String,
      default: "",
    },
    maincustomers: {
      type: String,
      default: "",
    },
    websitetofeel: {
      type: String,
      default: "",
    },
    coloursprefer: {
      type: String,
      default: "",
    },
    coloursavoid: {
      type: String,
      default: "",
    },
    referencesites: {
      type: String,
      default: "",
    },
    specificidea: {
      type: String,
      default: "",
    },
    uploadimage: [
      {
        type: String,
        default: "",
      },
    ],
    likeustoknow: {
      type: String,
      default: "",
    },
  },

  { timestamps: true, versionKey: false }
);

const websitedesignmodel = model("websitedesign", websitedesignSchema);
export default websitedesignmodel;

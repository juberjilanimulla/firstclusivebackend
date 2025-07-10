import { Schema, model } from "mongoose";

const logoSchema = new Schema(
  {
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
    brandtofeel: {
      type: String,
      default: "",
    },
    colours: {
      type: String,
      default: "",
    },
    coloursavoid: {
      type: String,
      default: "",
    },
    logodoprefer: {
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

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

logoSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

logoSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const logomodel = model("logo", logoSchema);
export default logomodel;

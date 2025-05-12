import mongoose, { Schema, model } from "mongoose";

const jobapplicantSchema = new Schema(
  {
    jobid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "career",
    },
    fullname: String,
    email: String,
    contact: String,
    yearofexperience: String,
    pdf: {
      type: String,
      default: "",
    },
    termsaccepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

jobapplicantSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

jobapplicantSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const jobapplicantmodel = model("jobapplicant", jobapplicantSchema);
export default jobapplicantmodel;

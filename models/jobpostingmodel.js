import { Schema, model } from "mongoose";

const jobpostingSchema = new Schema(
  {
    jobtitle: { type: String, required: true },
    tagline: { type: String, required: true },
    companydescription: { type: String, required: true },
    location: { type: String, required: true },
    jobtype: {
      type: String,
      enum: ["On-Site", "Remote", "Hybrid"],
      default: "On-Site",
    },
    employmenttype: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contractual"],
      default: "Full-Time",
    },
    experiencerequired: { type: String },
    roledescription: { type: String },
    responsibilities: [{ type: String, required: true }],
    requiredskills: [{ type: String, required: true }],
    qualifications: [{ type: String, required: true }],
    workinghours: { type: String, required: true },
    perksandbenefits: [{ type: String }],
    contactinfo: { type: String },
    published: {
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

jobpostingSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

jobpostingSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const jobpostingmodel = model("jobposting", jobpostingSchema);
export default jobpostingmodel;

import { Schema, model } from "mongoose";

const jobpostingSchema = new Schema(
  {
    jobtitle: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },

    details: {
      company_description: { type: String, required: true },
      role_description: { type: String, required: true },
      qualifications: [{ type: String }],
      bonus: [{ type: String }],
    },

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

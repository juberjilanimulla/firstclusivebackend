import { Schema, model } from "mongoose";

const teamSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    role: String,
    description: String,
    message: String,
    profileimg: {
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

teamSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

teamSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const teamModel = model("team", teamSchema);
export default teamModel;

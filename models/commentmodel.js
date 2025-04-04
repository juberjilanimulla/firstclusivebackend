import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    blogid: {
      type: Schema.Types.ObjectId,
      ref: "blog",
    },
    name: String,
    email: String,
    mobile: {
      type: String,
      default: "-",
    },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

commentSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

commentSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const commentmodel = model("comment", commentSchema);
export default commentmodel;

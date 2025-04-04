import { Router } from "express";
import contactRouter from "./contactRouter.js";
import careerRouter from "./careerRouter.js";
import commentRouter from "./commentRouter.js";

const userRouter = Router();

export default userRouter;

userRouter.use("/contact", contactRouter);
userRouter.use("/career", careerRouter);
userRouter.use("/comment", commentRouter);

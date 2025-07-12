import { Router } from "express";
import contactRouter from "./contactRouter.js";
import commentRouter from "./commentRouter.js";
import jobapplicantRouter from "./jobapplicantRouter.js";
import userjobpostingRouter from "./userjobpostingRouter.js";
import userblogRouter from "./userblogRouter.js";
import userlogoRouter from "./userlogoRouter.js";
import userbillingRouter from "./userbillingRouter.js";
import userpaymentRouter from "./userpaymentRouter.js";

const userRouter = Router();

export default userRouter;

userRouter.use("/contact", contactRouter);
userRouter.use("/comment", commentRouter);
userRouter.use("/jobapplicant", jobapplicantRouter);
userRouter.use("/jobposting", userjobpostingRouter);
userRouter.use("/blog", userblogRouter);
userRouter.use("/logo", userlogoRouter);
userRouter.use("/billing", userbillingRouter);
userRouter.use("/payment", userpaymentRouter);

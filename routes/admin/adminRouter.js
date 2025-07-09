import { Router } from "express";
import admincontactRouter from "./admincontactRouter.js";
import adminteamRouter from "./adminteamRouter.js";
import adminblogRouter from "./adminblogRouter.js";
import adminjobpostingRouter from "./adminjobpostingRouter.js";
import admincommentRouter from "./admincommentRouter.js";
import adminjobapplicantsRouter from "./adminjobapplicantRouter.js";
import adminlogoRouter from "./adminlogoRouter.js";

const adminRouter = Router();

adminRouter.use("/contact", admincontactRouter);
adminRouter.use("/team", adminteamRouter);
adminRouter.use("/jobposting", adminjobpostingRouter);
adminRouter.use("/blogs", adminblogRouter);
adminRouter.use("/comment", admincommentRouter);
adminRouter.use("/jobapplicants", adminjobapplicantsRouter);
adminRouter.use("/logo", adminlogoRouter);

export default adminRouter;

import { Router } from "express";
import admincontactRouter from "./admincontactRouter.js";
import adminteamRouter from "./adminteamRouter.js";
import notificationRouter from "./notifiactionRouter.js";
import adminblogRouter from "./adminblogRouter.js";
import adminjobpostingRouter from "./adminjobpostingRouter.js";
import admincommentRouter from "./admincommentRouter.js";
import adminjobapplicantsRouter from "./adminjobapplicantRouter.js";

const adminRouter = Router();

adminRouter.use("/contact", admincontactRouter);

adminRouter.use("/team", adminteamRouter);
adminRouter.use("/notification", notificationRouter);
adminRouter.use("/jobposting", adminjobpostingRouter);
adminRouter.use("/blogs", adminblogRouter);
adminRouter.use("/comment", admincommentRouter);
adminRouter.use('/jobapplicants',adminjobapplicantsRouter)
export default adminRouter;

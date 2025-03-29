import { Router } from "express";
import admincontactRouter from "./admincontactRouter.js";
import adminteamRouter from "./adminteamRouter.js";
import notificationRouter from "./notifiactionRouter.js";
import adminjobRouter from "./adminjobRouter.js";
import adminblogRouter from "./adminblogRouter.js";

const adminRouter = Router();

adminRouter.use("/contact", admincontactRouter);

adminRouter.use("/team", adminteamRouter);
adminRouter.use("/notification", notificationRouter);
adminRouter.use("/job", adminjobRouter);
adminRouter.use("/blogs", adminblogRouter);
export default adminRouter;

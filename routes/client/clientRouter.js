import { Router } from "express";
import contactRouter from "./contactRouter.js";
import careerRouter from "./careerRouter.js";



const clientRouter = Router()

export default clientRouter

clientRouter.use("/contact",contactRouter);
clientRouter.use("/career",careerRouter)
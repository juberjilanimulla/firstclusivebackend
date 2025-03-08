import { Router } from "express";
import { errorResponse, successResponse } from "../../helpers/serverResponse.js";
import notificationmodel from "../../models/notificationmodel.js";



const notificationRouter = Router();

notificationRouter.get("/",getnotificationHandler);

export default notificationRouter

async function getnotificationHandler(req,res){
    try {
        const notification = await notificationmodel.find().sort({createdAt:-1});
        return successResponse(res,"success",notification)
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}
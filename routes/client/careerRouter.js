import { Router } from "express";
import { errorResponse, successResponse } from "../../helpers/serverResponse.js";
import careermodel from "../../models/careermodel.js";
// import { GetJobidNumber } from "../../helpers/helperFunction.js";
import cvpdfRouter from "./uploadcv.js";




const careerRouter = Router()

careerRouter.post("/create",createcareerHandler);
careerRouter.use("/uploadcv",cvpdfRouter)
export default careerRouter

async function createcareerHandler(req,res){
    try {
      const {jobtitle,name,email,mobile,linkedinlink}=req.body;
      if(!jobtitle || !name ||!email ||!mobile ||!linkedinlink){
        return errorResponse(res,400,"some params are missing")
      }

      const existingCareer = await careermodel.findOne({ email });

      if (existingCareer) {
          return errorResponse(res, 400, "You have already submitted the form");
      }

      // const jobid = await GetJobidNumber()
      const career = await careermodel.create({

        jobtitle,
        name,
        email,
        mobile,
        linkedinlink
      })
      successResponse(res,"success",career)
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}
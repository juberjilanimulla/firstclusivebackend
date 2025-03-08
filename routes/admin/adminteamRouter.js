import { Router } from "express";
import { errorResponse, successResponse } from "../../helpers/serverResponse.js";
import teamModel from "../../models/teammodel.js";
import imgprofileuploadRouter from "./uploadimageRouter.js";



const adminteamRouter = Router()


adminteamRouter.get("/",getteamHandler);
adminteamRouter.post("/create",createteamHandler)
adminteamRouter.use("/uploadimage",imgprofileuploadRouter)
adminteamRouter.post("/update",updateteamHandler);
adminteamRouter.post("/delete",deleteteamHandler);
adminteamRouter.get("/single",getsingleteamHandler)

export default adminteamRouter

async function getteamHandler(req,res){
    try {
        const team = await teamModel.find();
       successResponse(res,"success",team)
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}

async function createteamHandler(req,res){
    try {
        const {name,role,description,message} = req.body;
        
        if(!name ||!role ||!description ||!message){
            return errorResponse(res,400,"some params are missing")
        }
        const team = await teamModel.create({
            name,
            role,
            description,
            message
        })
        if(!team){
            return errorResponse(res,404,"some error while creating")
        }
        successResponse(res,"success",team)
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error") 
    }
}

async function updateteamHandler(req,res){
    try {
        const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.name ||
      !updatedData.role ||
      !updatedData.description ||
      !updatedData.message 
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const updated = await teamModel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );

    successResponse(res, "success Updated", updated);
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}

async function deleteteamHandler(req,res){
    try {
        const {_id} = req.body;
        if(!_id){
            return errorResponse(res,400,"some params are missing")
        }
        const team = await teamModel.findByIdAndDelete({_id:_id});
        if(!team){
            return errorResponse(res,404,"team id not found")
        }
        successResponse(res,"Success")
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}

async function getsingleteamHandler(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        return errorResponse(res, 404, "some params are missing");
      }
      const data = await teamModel
        .findById(id)
        .select(" -_id");
      if (!data) {
        return errorResponse(res, 404, "id not found");
      }
      successResponse(res, "Success", data);
    } catch (error) {
      console.log("error", error);
      errorResponse(res, 500, "internal server error");
    }
  }
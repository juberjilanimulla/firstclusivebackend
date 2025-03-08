
import {Schema,model} from "mongoose";
import { GetJobidNumber } from "../helpers/helperFunction.js";

const careerSchema = new Schema({
    jobid:{
    type: String,
    unique: true,
    },
    jobtitle:String,
    description:String,
    companydescription:String,
    roledescription:String,
    qualifications:String,
    bonusskills:String,
    name:String,
    email:String,
    mobile:Number,
    linkedinlink:String,
    pdf: {
      type: String,
      default: "",
    },
},{timestamps:true,versionKey:false})

careerSchema.pre("save", async function (next) {
    if (!this.jobid) {
      try {
        this.jobid = await GetJobidNumber();
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });

function currentLocalTimePlusOffset(){
    const now = new Date();
    const offset = 5.5*60*60*1000;
    return new Date(now.getTime()+offset);
}

careerSchema.pre("save",function (next){
    const currentTime = currentLocalTimePlusOffset();
    this.createdAt=currentTime;
    this.updatedAt=currentTime;
    next();
})

careerSchema.pre("findOneAndUpdate",function (next){
    const currentTime = currentLocalTimePlusOffset();
    this.set({updatedAt:currentTime})
    next();
})


const careermodel = model("career",careerSchema);
export default careermodel

import {Schema,model} from "mongoose";

const careerSchema = new Schema({
    jobtitle:String,
    description:String,
    companydescription:String,
    roledescription:String,
    qualifications:String,
    bonusskills:String,
    address:String
},{timestamps:true,versionKey:false})

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
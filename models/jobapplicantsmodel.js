import { Schema,model } from "mongoose";



const jobapplicantSchema = new Schema({
    
    fullname:String,
    email:String,
    contact:String,
    yearofexperience:String,
    pdf:String,
    
},{timestamps:true,versionKey:false})

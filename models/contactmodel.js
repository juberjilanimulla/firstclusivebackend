
import { Schema,model } from "mongoose";

const contactSchema = new Schema({
    name:String,
    companyName:String,
    mobile:Number,
    email:String,
    subject: {
        type: String,
        enum: ["Logo & Branding", "UI/UX Design", "Web Development", "Digital Marketing", "Printing"],
        required: true,
      },
      message:String,
      password:String
},{timestamps:true,versionKey:false})

function currentLocalTimePlusOffset(){
    const now = new Date();
    const offset = 5.5*60*60*1000;
    return new Date(now.getTime()+offset)
}

contactSchema.pre("save",function (next){
    const currentTime = currentLocalTimePlusOffset();
    this.createdAt=currentTime;
    this.updatedAt=currentTime;
    next();
})

contactSchema.pre("findOneAndUpdate",function (next){
    const currentTime = currentLocalTimePlusOffset();
    this.set({updatedAt:currentTime});
    next()
})

const contactmodel =model("contact",contactSchema);
export default contactmodel
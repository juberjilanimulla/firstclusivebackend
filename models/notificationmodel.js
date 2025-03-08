import {Schema,model} from "mongoose"


const notificationSchema=new Schema({
    message:String,
    userid:{
        type:String,
        ref:"user"
    },
},{timestamps:true,versionKey:false})

function currentLocalTimePlusOffset(){
    const now = new Date();
    const offset = 5.5*60*60*1000;
    return new Date(now.getTime()+offset)
}

notificationSchema.pre("save",function (next){
    const currentTime = currentLocalTimePlusOffset();
    this.createdAt=currentTime;
    this.updatedAt=currentTime;
    next();
})

notificationSchema.pre("findOneAndUpdate",function (next){
     const currentTime = currentLocalTimePlusOffset();
     this.set({updatedAt:currentTime});
     next();
})

const notificationmodel = model("notification",notificationSchema);
export default notificationmodel
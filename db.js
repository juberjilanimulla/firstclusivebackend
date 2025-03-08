import mongoose from "mongoose";
import config from "./config.js";

async function dbConnect(){
    try {
        await mongoose.connect(config.MONGODB_URL);
        console.log("database connected successfully")
    } catch (error) {
        console.log("unable to connected to database",error)
    }
}

export default dbConnect;
import mongoose from "mongoose";
import { config } from "./env.js";

const connectDB = async () => {
  try {

    const MONGO_URI = config.NODE_ENV === "production" ? config.MONGO_URI_CLOUD : config.MONGO_URI_LOCAL

    const connection = await mongoose.connect(MONGO_URI,{
      dbName:"food-delivery-system"
    });
    console.log(`Database connected to ${connection.connection.host}`);
  } catch (error) {
    console.log("DB Connection error ", error.message);
  }
};


export default connectDB ;

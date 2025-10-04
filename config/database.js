import mongoose from "mongoose";
import { config } from "./env.js";

const connectDB = async () => {
  try {

    const MONGO_URI = config.MONGO_URI_CLOUD
  

    const connection = await mongoose.connect(MONGO_URI,{
      dbName:"food-delivery-system"
      // dbName:"Yumz"
    });
    console.log(`Database connected to ${connection.connection.host}`);
  } catch (error) {
    console.log("DB Connection error ", error.message);
  }
};


export default connectDB ;

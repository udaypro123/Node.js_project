import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

export const connectDB=async()=>{
    try {
        const databaseConnect= await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`connection succesful on port ${process.env.PORT}`,databaseConnect)
    } catch (error) {
        console.log("mongodb connection faild", error)
    }
}
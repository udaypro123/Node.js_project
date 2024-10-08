import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config({
    path:'./env'
})


connectDB().then(()=>{
    app.listen(process.env.PORT || 6000, ()=>{
        console.log(`server running on port ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("monog db connection failed", error)
})
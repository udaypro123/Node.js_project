import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginage  from 'mongoose-aggregate-paginate-v2'

const videoSchema= new Schema({

    videofile:{
        type:String,
        required:true,
    }, 
    thmbnail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    ispublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }

}, {timestamps:true})

videoSchema.plugin(mongooseAggregatePaginage)
export const Video= mongoose.model("Video",videoSchema)
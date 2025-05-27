import mongoose from "mongoose";

const requestSchema = mongoose.Schema({
    status:{
        type:String,
        default:"pending",
        enum:["accepted","rejected"]
    },
    sender:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Types.ObjectId,
        red:"User",
        required:true
    }
})

export const Request = mongoose.model("Request",requestSchema)
import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    groupname:{
        type:String,
        required:true
    },
    user:{
        type:String,
        required:true
    },
    groupchat:{
        type:Boolean,
        default:false
    },
    creator:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    members:[{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }]
},{timestamps:true})


export const Chat = mongoose.model('Chat',chatSchema)
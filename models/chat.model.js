import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
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
    member:[{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }]
})


export const Chat = mongoose.model('Chat',chatSchema)
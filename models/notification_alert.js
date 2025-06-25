import mongoose from "mongoose";

const notificationAlert = mongoose.Schema({
    receiverId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    chatId:{
        type:mongoose.Types.ObjectId,
        ref:"Chat",
        required:true
    },
    totalNotifaction:{
        type:Number,
        default:0
    }
})

export const Notification = mongoose.model("Notification",notificationAlert)
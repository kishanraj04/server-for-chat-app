import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  attachments: [{
    public_id: {
      type: String
    },
    url: {
      type: String
    }
  }],
  content: {
    type: String,
    required: true
  },
  sender: {
    
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    
  },
  chat: {
    type: mongoose.Types.ObjectId,
    ref: "Chat",
    required: true
  }
}, { timestamps: true });


export const Message = mongoose.model("Message",messageSchema)
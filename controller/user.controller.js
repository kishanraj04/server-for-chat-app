import { User } from "../models/user.model.js";
import cloudinaryconfig from "../connectdb/cloudinary.js";
import {v2 as cloudinary} from 'cloudinary'
import fs from "fs/promises";
import { Chat } from "../models/chat.model.js";
import { emitEvent } from "../utils/chat.features.js";
import {Request} from "../models/request.model.js"

// register user
export const registerUser = async (req, res) => {
  
  const body = req.body;
  if (!req?.file) {
    return res
      .status(404)
      .json({ success: false, message: "no file selected" });
  }

  const isuserexist = await User.findOne({ name: body?.name });
   if (isuserexist) {
    return res.status(200).json({ success: false, message: "user exist" });
  }
  const filePath = req.file.path;
  console.log(filePath , body);
  const cloudinaryresp = await cloudinary.uploader.upload(filePath,{folder:"avatar"})
//   delte local file from dir
  //  fs.unlink(filePath, (err) => {
  //     if (err) console.error('Error deleting file:', err);
  //   });


 

  const avatar = {
    public_id: cloudinaryresp?.public_id,
    url:cloudinaryresp?.url,
  };

  const createdUser = await User.create({ ...body, avatar });
  res.status(200).json({ success: true, createduser: createdUser });
};

// get my profile
export const getMyProfile = async (req,res,next) =>{
  try {
    const {name} = req?.user 
    const useris = await User.findOne({name:name})
    return res.status(200).json({success:true,message:"user found",useris})
  } catch (error) {
    next(error)
  }
}

// search use
export const searchUser = async(req,res,next)=>{
  try {
    const {name} = req?.query
    const myChat =await Chat.find({groupchat:false,members:req?.user?._id})
    const allusers = myChat?.flatMap((chat)=>chat?.members)
 
    const allusr_exp_me = await User?.find({_id:{$nin:allusers},name:{$regex:name,$options:"i"}})
  
    const modifydata = allusr_exp_me?.map(({_id,name,avatar})=>({_id,name,avatar:avatar?.url}))

    return res.status(200).json({success:true,modifydata})
  } catch (error) {
    
  }
}

// send request
export const sendRequest = async(req,res,next)=>{
  try {
    const {userId} = req?.body
    const request = await Request.findOne({$or:[{
      sender:userId,receiver:req?.user?._id,
      sender:req?.user?._id,receiver:userId
    }]})
    if(request){
      const err = new Error()
      err.status=400
      err.message="request already send"
      return next(err)
    }

    const makereq = await Request.create({sender:req?.user?._id,receiver:userId})

    emitEvent(req,"new request",[userId])

    res.status(200).json({success:true,message:"friend req send"})
  } catch (error) {
    const err = new Error()
    err.status=500
    err.message=error.message
    return next(err)
  }
}

// accept request
export const acceptrequest = async(req,res,next)=>{
  try {
    const {requestId,accept} = req?.body
    const request = await Request.find({_id:requestId}).populate("sender","name").populate("receiver","name")

    if(!request){
      const err = new Error()
      err.status=404
      err.message="request not found"
      return next(err)
    }

    if(request?.receiver?.toString()!=req?.user?._id?.toString()){
      const err = new Error()
      err.status=401
      err.message="you are not authorized"
      return next(err)
    }

    if(!accept){
      await request.deleteOne()
      const err = new Error()
      err.status=202
      err.message="rejected"
      return next(err)
    }

    // after accepted
    const members = [request?.sender?._id,request?.receiver?._id]

    await Promise.all([Chat.create({members,groupname:`${request?.sender?.name}-${request?.receiver?.name}`}),request.deleteOne()])

    emitEvent(req,"refetch",members)

    return res.status(200).json({success:true,message:"request accepted",senderId:request?.sender?._id})
  } catch (error) {
    
  }
}
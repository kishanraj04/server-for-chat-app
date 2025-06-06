import { User } from "../models/user.model.js";
import cloudinaryconfig from "../connectdb/cloudinary.js";
import {v2 as cloudinary} from 'cloudinary'
import fs from "fs/promises";

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

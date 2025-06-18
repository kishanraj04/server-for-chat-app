import { User } from "../models/user.model.js";
import cloudinaryconfig from "../connectdb/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { Chat } from "../models/chat.model.js";
import { emitEvent } from "../utils/chat.features.js";
import { Request } from "../models/request.model.js";
import { otherUser } from "../lib/helper.js";

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
  console.log(filePath, body);
  const cloudinaryresp = await cloudinary.uploader.upload(filePath, {
    folder: "avatar",
  });
  //   delte local file from dir
  //  fs.unlink(filePath, (err) => {
  //     if (err) console.error('Error deleting file:', err);
  //   });

  const avatar = {
    public_id: cloudinaryresp?.public_id,
    url: cloudinaryresp?.url,
  };

  const createdUser = await User.create({ ...body, avatar });
  res.status(200).json({ success: true, createduser: createdUser });
};

// get my profile
export const getMyProfile = async (req, res, next) => {
  try {
    const { name } = req?.user;
    const useris = await User.findOne({ name: name });
    return res
      .status(200)
      .json({ success: true, message: "user found", useris });
  } catch (error) {
    next(error);
  }
};

// search use
export const searchUser = async (req, res, next) => {
  try {
    const { name } = req?.query;
    const id = req?.user?._id;
    const myChat = await Chat.find({
      groupchat: false,
      members: req?.user?._id,
    });
    const allusers = myChat?.flatMap((chat) => chat?.members);

    const allusr_exp_me = await User?.find({
      _id: { $nin: [...allusers, id] },
      name: { $regex: name, $options: "i" },
    });

    const modifydata = allusr_exp_me?.map(({ _id, name, avatar }) => ({
      _id,
      name,
      avatar: avatar?.url,
    }));

    return res.status(200).json({ success: true, modifydata });
  } catch (error) {}
};

// send request
export const sendRequest = async (req, res, next) => {
  try {
    const { userId } = req?.body;
    const request = await Request.findOne({
      $or: [
        {
          sender: userId,
          receiver: req?.user?._id,
          sender: req?.user?._id,
          receiver: userId,
        },
      ],
    });
    if (request) {
      const err = new Error();
      err.status = 400;
      err.message = "request already send";
      return next(err);
    }
    if (userId?.toString() == req?.user?._id?.toString()) {
      const err = new Error();
      err.status = 400;
      err.message = "you cant send request to itself";
      return next(err);
    }

    const makereq = await Request.create({
      sender: req?.user?._id,
      receiver: userId,
    });

    emitEvent(req, "new request", [userId]);

    res.status(200).json({ success: true, message: "friend req send" });
  } catch (error) {
    const err = new Error();
    err.status = 500;
    err.message = error.message;
    return next(err);
  }
};

// accept request
export const acceptrequest = async (req, res, next) => {
  try {
    const { requestId, accept } = req?.body;
    const isAccepted = accept === "true" ? true :false;
    
    console.log(requestId, accept);

    const request = await Request.findById({ _id: requestId })
      .populate("sender", "name")
      .populate("receiver", "name");
    if (!request) {
      const err = new Error();
      err.status = 404;
      err.message = "request not found";
      return next(err);
    }
    if (request?.receiver?._id?.toString() != req?.user?._id?.toString()) {
      const err = new Error();
      err.status = 401;
      err.message = "you are not authorized";
      return next(err);
    }
    console.log(typeof accept);
    if (!isAccepted) {
      console.log("rejected");
      await request.deleteOne();
      const err = new Error();
      err.status = 202;
      err.message = "rejected";
      return next(err);
    }

    // after accepted
    const members = [request?.sender?._id, request?.receiver?._id];

    await Promise.all([
      Chat.create({
        user: request?.sender?.name,
        members,
        groupname: `${request?.sender?.name}-${request?.receiver?.name}`,
      }),
      request.deleteOne(),
    ]);

    emitEvent(req, "refetch", members);

    return res
      .status(200)
      .json({
        success: true,
        message: "request accepted",
        senderId: request?.sender?._id,
      });
  } catch (error) {
    const err = new Error();
    err.status = 400;
    err.message = error.message;
    return next(err);
  }
};

// get my notigications
export const getMyNotifications = async (req, res, next) => {
  try {
    const requests = await Request.find({ receiver: req?.user?._id }).populate(
      "sender",
      "name avatar"
    );
    const transformresp = requests.map(({ _id, sender }) => ({
      _id,
      sender: {
        _id: sender?._id,
        name: sender?.name,
        avatar: sender?.avatar?.url,
      },
    }));

    return res.status(200).json({ success: true, data: transformresp });
  } catch (error) {}
};

// get my friends
export const getMyFriends = async (req, res, next) => {
  try {
    const chatId = req?.query?.chatId;
    const chat = await Chat.find({
      members: req?.user?._id,
      groupchat: false,
    }).populate("members", "name avatar");

    const firends = chat?.map(({ members }) => {
      const otheruser = otherUser(members, req?.user?._id);

      return {
        _id: otheruser?._id,
        name: otheruser?.name,
        avatar: otheruser?.avatar?.url,
      };
    });

    if (chatId) {
      const chat = await Chat.findById({ _id: chatId });
      const availablefriends = firends?.filter(
        (friend) => !chat?.members?.includes(friend?._id)
      );

      return res.status(200).json({ success: true, availablefriends });
    } else {
      res.status(200).json({ success: true, firends });
    }
  } catch (error) {}
};

// get all request
export const allRequest = async (req, res, next) => {
  try {
    const data = await Request.find({}).select("sender receiver");
    console.log(data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const err = new Error();
    err.status = 500;
    err.message = error.message;
    return next(err);
  }
};

// remove request
export const removeRequest = async(req,res,next)=>{
  try {
    const {requestId} = req.body
    console.log(requestId);
    const deleteRequest = await Request.findByIdAndDelete({_id:requestId},{new:true})
    console.log(deleteRequest);
    if(!deleteRequest){
      const err = new Error()
      err.status=404
      err.message="Not Found"
      return next(err)
    }

    res.status(200).json({success:true,message:"request deleted",deleteRequest})

  } catch (error) {
      const err = new Error()
      err.status=500
      err.message=error.message
      return next(err)
  }
}

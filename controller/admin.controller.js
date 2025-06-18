import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'

// verify admin
export const verifyAdmin = async(req,res,next)=>{
  try {
    const {secretkey} = req?.body

    const iscorrest = secretkey === process.env.ADMINKEY
    if(!iscorrest){
      const err = new Error()
      err.status=401
      err.message="not authorized"
      return next(err)
    }
    const admintoken = await jwt.sign(secretkey,process.env.ADMINKEY)
    return res.status(200).cookie("admintoken",admintoken,{
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      }).json({success:true,message:"admin login"})
  } catch (error) {
    const err = new Error()
    err.status=500
    err.message=error.message
    return next(err)
  }
}

// logout admin
export const logoutAdmin = async(req,res,next)=>{
  try {
     const token = req.cookies.admintoken
    if(!token){
        const err = new Error()
        err.message="user already logout"
        err.statue=200
        return next(err)
    }
    res.status(200).clearCookie("admintoken","").json({success:true,message:"admin logout"});
  } catch (error) {
    const err = new Error()
    err.status=500
    err.message=error.message
    return next(err)
  }
}

// all user
export const allUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    const modifydata = await Promise.all(
      users?.map(async ({ _id, avatar, name }) => {
        const [group, friends] = await Promise.all([
          Chat.countDocuments({ groupchat: true, members: _id }),
          Chat.countDocuments({ groupchat: false, members: _id }),
        ]);

        return {
          _id,
          avatar: avatar?.url,
          name,
          group,
          friends,
        };
      })
    );

    return res.status(200).json({ success: true, modifydata });
  } catch (error) {}
};

// all chats
export const allChats = async (req, res, next) => {
  try {
    const allchats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");
    console.log(allchats);
    const modifyData = await Promise.all(
      allchats.map(async ({ _id, members,user,groupchat, creator }) => {
        const totalMsg = await Message.countDocuments({ chat: _id }); // 

        return {
          _id,
          groupchat,
          name:user,
          creator: creator?.name || "Unknown",
          avatar: creator?.avatar?.url || null,
          members: members?.length || 0,
          totalMsg,
        };
      })
    );

    return res.status(200).json({ success: true, modifyData });
  } catch (error) {
    const err = new Error();
    err.status = 500;
    err.message = error?.message;
    return next(err);
  }
};

// all messages
export const allMessages = async(req,res,next)=>{
    try {
  const messages = await Message.find({}).populate("chat").populate("sender","name avatar")
 

  const modifydata = messages.map(({ _id, content, attachments, sender, createdAt, chat }) => ({
    _id,
    attachments,
    content,
    createdAt,
    chat: chat?._id,
    groupchat: chat?.groupchat,
    sender: {
      _id: sender?._id,
      name: sender?.name,
      avatar: sender?.avatar?.url || null
    }
  }));

  return res.status(200).json({ success: true, messages });
} catch (error) {
  const err = new Error(error.message || "Internal Server Error");
  err.status = 500;
  return next(err);
}

}

// dashboard
export const getDashBoard = async (req, res, next) => {
  try {
    const [usercount, messagecount, groupcount, singlechat] = await Promise.all([
      User.countDocuments({}),
      Message.countDocuments({}),
      Chat.countDocuments({ groupchat: true }),
      Chat.countDocuments({ groupchat: false }),
    ]);

    // last 7 days messages
    const today = new Date();
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);

    const last7daysmsg = await Message.find({
      createdAt: { $gte: last7days, $lte: today }
    }).select("createdAt");

    const msg = new Array(7).fill(0);

    last7daysmsg.forEach(message => {
      const diffInDays = Math.floor((today.getTime() - message.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays >= 0 && diffInDays < 7) {
        msg[6 - diffInDays]++;
      }
    });

    res.status(200).json({
      success: true,
      usercount,
      messagecount,
      groupcount,
      singlechat,
      message: msg
    });

  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};

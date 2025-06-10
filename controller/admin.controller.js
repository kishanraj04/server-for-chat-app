import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

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
import { otherUser } from "../lib/helper.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { deleteAttachments, emitEvent } from "../utils/chat.features.js";

// group chat
export const groupChat = async (req, res, next) => {
  try {
    const { groupname, members } = req?.body;
    const you = req?.user;
    if (members?.length < 2) {
      const err = new Error();
      err.message = "members should greter than 2";
      err.status = 400;
      return next(err);
    }

    const allmembers = [...members, you?._id];

    const createdGroup = await Chat.create({
      groupname,
      user: you?.name,
      groupchat: true,
      members: allmembers,
      creator: you?._id,
    });

    // event(req,"kishan",allmembers,`welcome to ${you?.name} group chat`)
    // event(req,"refetch data",members)

    res
      .status(200)
      .json({ success: true, message: "group created", createdGroup });
  } catch (error) {
    next(error);
  }
};

// get my chats
export const getMyChats = async (req, res, next) => {
  const chats = await Chat.find({ members: req?.user?._id }).populate(
    "members",
    "name avatar"
  );

  const transformchats = chats.map(({ _id, user, members, groupchat }) => {
    const otheruser = otherUser(members, _id);

    const avatars = groupchat
      ? members.slice(0, 3).map(({ avatar }) => avatar?.url)
      : [...otheruser?.avatar?.url];

    const chatName = groupchat ? user : otheruser?.name;

    const myId = req.user._id.toString();

    return {
      _id,
      groupchat,
      avatar: avatars,
      name: chatName,
      members: members
        .filter((member) => member._id.toString() !== myId)
        .map((member) => member._id.toString()), // Only include their _id as string
    };
  });

  res.status(200).json({ success: true, transformchats });
};

// get my groups
export const getMyGroups = async (req, res, next) => {
  const mygroup = await Chat.find({
    creator: req?.user?._id,
    members: req?.user?._id,
    groupchat: true,
  }).populate("members", "name avatar");

  const transformdata = mygroup
    .slice(0, 3)
    ?.map(({ _id, members, user, groupchat }) => {
      return {
        _id,
        user,
        groupchat,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar?.url),
      };
    });

  res.status(200).json({ success: true, transformdata });
};

// Add members to a group chat
export const addMember = async (req, res, next) => {
  const { chatId, newMembers } = req.body;

  // Validate members input
  if (!newMembers || newMembers.length < 1) {
    const err = new Error("Please provide members");
    err.status = 404;
    return next(err);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    const err = new Error("Chat not found");
    err.status = 404;
    return next(err);
  }

  if (!chat.groupchat) {
    const err = new Error("Not a group chat");
    err.status = 400;
    return next(err);
  }

  // Only the creator can add members
  if (chat.creator.toString() !== req.user._id.toString()) {
    const err = new Error("Not allowed to add members");
    err.status = 403;
    return next(err);
  }

  // Fetch user data for new members
  const newMembersData = await Promise.all(
    newMembers.map((id) => User.findById(id, "name _id"))
  );

  // Remove duplicates: keep only those not already in chat.members
  const existingMemberIds = chat.members.map((id) => id.toString());

  const uniqueMembersToAdd = newMembersData
    .filter((user) => user && !existingMemberIds.includes(user._id.toString()))
    .map((user) => user._id);

  if (uniqueMembersToAdd.length === 0) {
    return res
      .status(200)
      .json({
        success: false,
        message: "No new members added. All are already in the chat.",
      });
  }

  // Add unique new members
  chat.members.push(...uniqueMembersToAdd);
  await chat.save();

  const addedUsernames = newMembersData
    .filter((user) => uniqueMembersToAdd.includes(user._id))
    .map((user) => user.name)
    .join(", ");

  // Emit socket events
  emitEvent(req, "send", chat.members, `New user(s) ${addedUsernames} joined`);
  emitEvent(req, "refetch", chat.members);

  res
    .status(200)
    .json({ success: true, chat, message: "Members added successfully" });
};

// remove members from group
export const removeMember = async (req, res, next) => {
  const { chatId, userId } = req?.body;
  try {
    const group = await Chat.findById({ _id: chatId });
    const username = await User.findById({ _id: userId }, "name");
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "group not found" });
    }
    if (!userId || !chatId) {
      return res
        .status(404)
        .json({ success: false, message: "something missing" });
    }
    if (group?.members?.length <= 3) {
      return res
        .status(500)
        .json({ success: false, message: "group at least have 3 member" });
    }
    group.members = group?.members?.filter(
      (id) => id?.toString() != userId?.toString()
    );
    await group.save();

    emitEvent(req, "alert", group?.members, `user ${username} is removed`);

    emitEvent(req, "refetch", group?.members);

    res.status(200).json({ success: true, message: "member deleted", group });
  } catch (error) {
    res.status(500).json({ success: false, message: error?.message });
  }
};

// leave from group
export const leaveFromGroup = async (req, res, next) => {
  try {
    const { gid } = req?.params;
    const group = await Chat.findById({ _id: gid });
    const userid = req?.user?._id;
    if (!gid) {
      const err = new Error();
      err.status = 404;
      err.message = "not a valid gorup";
      next(err);
    }
    if (!group) {
      const err = new Error();
      err.status = 404;
      err.message = "group not found";
      next(err);
    }
    if (group?.creator == userid) {
      const deletedGroup = await Chat.findByIdAndDelete({ _id: gid });

      return res
        .status(200)
        .json({
          success: true,
          message: "admin destroyed this group",
          deletedGroup,
        });
    }
    group.members = group?.members?.filter(
      (id) => id?.toString() != userid?.toString()
    );
    await group.save();

    res.status(200).json({ success: true, message: "you leaved from group" });
  } catch (error) {
    next(error.message);
  }
};

// send attachment and message
export const sendAttachment = async (req, res, next) => {
  try {
    const { chatId } = req.body;

    const userId = req?.user?._id;
    const [chat, me] = await Promise.all([
      Chat.findById({ _id: chatId }),
      User.findById({ _id: userId }, "name"),
    ]);
    const files = req?.files || [];
    if (!chat) {
      const err = new Error();
      err.status = 404;
      err.message = "chat not found";
      return next(err);
    }
    if (files.length < 1) {
      const err = new Error();
      err.status = 400;
      err.message = "please provide attachment";
      return next(err);
    }

    // upload here
    const attachments = [];

    // message for db
    const messageForDb = {
      content: "hiii",
      attachments,
      chat: chatId,
      sender: {
        _id: userId,
        name: me?.name, 
      },
    };

    const createdMessage = await Message.create(messageForDb);
    console.log(createdMessage);

    // emit event
    emitEvent(req, "New attachment", chat.members, {
      message: messageForDb,
      chatId,
    });

    emitEvent(req, "new alert", chat.members, { chatId });
    return res.status(200).json({ success: true, createdMessage });
  } catch (error) {
    const err = new Error()
    err.status=500;
    err.message=error.message
  }
};

// get chat details
export const getChatDetails = async(req,res,next) =>{
  try {
    if(req.query.populate=='"true"'){
      const chat = await Chat.findById(req.params.id).populate("members","name avatar").lean()

      if(!chat){
        const err = new Error()
        err.status=404
        err.message="chat not found"
      }

      chat.members = chat?.members?.map(({_id,name,avatar})=>({_id,name,avatar:avatar?.url}))

      return res.status(200).json({success:true,chat})
    }else{
      const chat = await Chat.findById({_id:req.params.id})
      if(!chat){
        const err = new Error()
        err.status=404
        err.message="chat not found"
        return next(err)
      }

     return res.status(200).json({success:true,chat})
    }
  } catch (error) {
    const err = new Error()
    err.status=500
    err.message=error.message
    next(err)
  }
}

// rename froup
export const remaneGroup = async(req,res,next)=>{
  try {
    const {chatId,name} = req.body
    const chat = await Chat.findByIdAndUpdate({_id:chatId},{$set:{groupname:name}},{new:true})

    if(!chat){
      const err = new Error()
      err.status=404
      err.message="chat not found"
      return next(err)
    }

    if(!chat?.groupchat)
    {
      const err = new Error()
      err.status=400
      err.message="not a group chat"
      return next(err)
    }
    if(chat?.creator?.toString!=req?.user?._id?.toString()){
      const err = new Error()
      err.status=401
      err.message="you cant change the group name"
      return next(err)
    }

    emitEvent(req,"refetch chat",chat?.members)
    return res.status(200).json({success:true,message:"renamed",chat})

  } catch (error) {
    const err = new Error()
    err.status=500
    err.message=error.message
    return next(err)
  }
}

// delete chat
export const deleteChat = async(req,res,next)=>{
  try {
    const chatId = req.params.id
    const chat = await Chat.findById({_id:chatId});
    if(!chat){
      const err = new Error()
      err.status=404;
      err.message="chat not found"
      return next(err)
    }

    const members = chat?.members
    console.log(members);
    if(chat?.groupchat && chat?.creator!=req?.user?._id){
      const err = new Error()
      err.status=401;
      err.message="you are not allowed"
      return next(err)
    }

    if(!chat?.groupchat && !chat?.members?.includes(req?.user?._id)){
        const err = new Error()
      err.status=401;
      err.message="you are not allowed"
      return next(err)
    }

    // here we delete all messages and attach.. from cloudinary
    const msgandattachment = await Message.find({
      chat:chatId
    })
    
    const public_ids = [];
    msgandattachment.forEach(({attachments}) => {
      attachments?.forEach(({public_id})=>{
        public_ids.push(public_id)
      })     
    });
    await Promise.all([deleteAttachments(public_ids),Chat.deleteOne(),Message.deleteMany({chat:chatId})])

    emitEvent(req,"refetch",members)

    return res.status(200).json({success:true,message:"chat deleted"})
  } catch (error) {
    const err = new Error()
    err.status=500
    err.message=error.message
    next(err)
  }
}
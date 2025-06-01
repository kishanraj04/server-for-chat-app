import { event } from "../constants/events.js";
import { otherUser } from "../lib/helper.js";
import { Chat } from "../models/chat.model.js";

// group chat
export const groupChat = async (req, res, next) => {
  try {
    const { name, members } = req?.body;
    const you = req?.user;
    if (members?.length < 2) {
      const err = new Error();
      err.message = "members should greter than 2";
      err.status = 400;
      return next(err);
    }

    const allmembers = [...members, you?._id];

    const createdGroup = await Chat.create({
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


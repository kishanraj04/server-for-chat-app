import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v4 as uuid } from "uuid";
import "./connectdb/connectdb.js";
import "./utils/createfolder.js";
import { userRoute } from "./routes/user.route.js";
import { uploadAvatar } from "./middleware/upload.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { chatRoute } from "./routes/chat.route.js";
import { adminRoute } from "./routes/admin.route.js";
import { getAllSockets } from "./helper/helper.js";
import { Message } from "./models/message.model.js";
import { socketAuthenticator } from "./auth/auth.js";
import { Notification } from "./models/notification_alert.js";
import mongoose from "mongoose";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// ✅ Apply Socket Middleware
io.use((socket, next) => {
  // Apply cookie-parser manually to socket.request
  cookieParser()(socket.request, {}, (err) => {
    if (err) return next(err);

    // Now pass to your socketAuthenticator
    socketAuthenticator(null, socket, next);
  });
});

// ✅ Store user => socketId mapping
const usersocketIds = new Map();

// ✅ Socket Connection
let sockets = [];

const samechat = false;

io.on("connection", async (socket) => {
  const currUser = socket.user1;
  // console.log("CU ", currUser);
  usersocketIds.set(currUser?._id.toString(), socket.id);

  // const totalNotification = await Notification.find({})

  // io.emit("OLD_NOTI", {
  //     notification: totalNotification,
  //   });

  socket.on("NEW_MESSAGE", async ({ chatId, members, message, loginUser }) => {
    const realtimemsg = {
      chat: chatId,
      _id: uuid(),
      content: message,
      sender: {
        _id: currUser._id,
        name: currUser.name,
      },
      createdAt: new Date(),
    };

    // console.log(chatId);

    try {
      await Message.create({
        content: message,
        chat: chatId,
        sender: currUser._id,
      });
    } catch (error) {
      console.log(error.message);
    }

    const oponentUser =
      members[0].toString() != loginUser ? members[0] : members[1];

    const updateMsgCount = await Notification.findOneAndUpdate(
      {
        receiverId: new mongoose.Types.ObjectId(oponentUser),
        chatId: new mongoose.Types.ObjectId(chatId),
      },
      { $inc: { totalNotifaction: 1 } },
      { new: true, upsert: true }
    );

    const totalNotification = await Notification.find({});
    const userSockets = getAllSockets(members);
    io.to(userSockets).emit("NEW_MESSAGE", { chatId, message: realtimemsg });
    io.to(userSockets).emit("NOTIFICATION", {
      chatId,
      notification: totalNotification,
    });
  });

  socket.on("clearNotification", async (data) => {
    try {
      const { chatId, receiverId, members } = data;

      console.log("chat ", chatId, "si ", "ri ", receiverId);

      // ✅ Delete it
      const deleteNotification = await Notification.findOneAndDelete({
        chatId: chatId,
        receiverId: receiverId,
      });
      // console.log("dn ",deleteNotification);
      // ✅ Get updated list of all notifications
      const totalNotification = await Notification.find({});

      const userSockets = getAllSockets(members);
      // console.log("TN ",totalNotification);
      // Optionally emit updated notification
      io.to(userSockets).emit("NOTIFICATION", {
        notification: totalNotification,
      });
    } catch (error) {
      console.log("❌ clearNotification error:", error.message);
    }
  });

  socket.on("START_TYPING", ({ members, chatId }) => {
    const userSockets = getAllSockets(members);
    io.to(userSockets).emit("START_TYPING", { chatId });
  });

  socket.on("STOP_TYPING", ({ chatId, members }) => {
    const userSockets = getAllSockets(members);
    io.to(userSockets).emit("STOP_TYPING", { chatId });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    usersocketIds.delete(currUser._id.toString());
  });
});

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS for HTTP routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Routes
app.get("/hii", (req, res) => {
  res.status(200).json({ message: "hello" });
});

app.use("/api/v1/user", uploadAvatar, userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

// ✅ Error Handler
app.use(errorHandler);

// ✅ Start Server
server.listen(3000, () => {
  console.log("server listening on port 3000");
});

export { usersocketIds, sockets };

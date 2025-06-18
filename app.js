import express from "express";
import { userRoute } from "./routes/user.route.js";
import "./connectdb/connectdb.js";
import { uploadAvatar } from "./middleware/upload.js";
import "./utils/createfolder.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import { chatRoute } from "./routes/chat.route.js";
import { adminRoute } from "./routes/admin.route.js";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { Server } from "socket.io";
import { getAllSockets } from "./helper/helper.js";
import { Message } from "./models/message.model.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {});

// parse body
app.use(express.json());

// cors
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
  methods:["GET","POST","PUT","DELETE"]
}))

// cookie parser
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.get("/hii",(req,res)=>{
  res.status(200).json({message:"hello"})
})

// user route
app.use("/api/v1/user", uploadAvatar, userRoute);
// chat route
app.use("/api/v1/chat", chatRoute);
// admin route
app.use("/api/v1/admin", adminRoute);

const usersocketIds = new Map();
// socket

const tmpuser = {
  _id: "6845b5fcbcfd72f8cc79eeb3",
  name: "kishu",
};
io.on("connection", (socket) => {
  usersocketIds.set(tmpuser?._id, socket?.id);

  console.log(usersocketIds);

  socket.on("NEW_MESSAGE", async ({ chatId, members, message }) => {
    const realtimemsg = {
      chat: chatId,
      _id: uuid(),
      content: message,
      sender: {
        _id: tmpuser?._id,
        name: tmpuser?._id,
      },
      createdAt: new Date()
    };

    const dbmsg = {
      content: message,
      chat: chatId,
      sender: tmpuser?._id,
    };

    try {
      await Message.create(dbmsg)
    } catch (error) {
      console.log(error.message);
    }

    const userSockets = getAllSockets(members, usersocketIds);
    io.to(userSockets).emit("NEW_MESSAGE",{
      chatId,
      message:realtimemsg
    })

    // alert notification
    io.to(userSockets).emit("NOTIFICATION",{chatId})
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    usersocketIds.delete(tmpuser?._id?.toString());
  });
});

// err handler
app.use(errorHandler);

server.listen(3000, () => {
  console.log("sever listen on 3000");
});

export { usersocketIds };

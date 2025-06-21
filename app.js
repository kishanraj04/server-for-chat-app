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

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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
io.on("connection", (socket) => {
  const currUser = socket.user1;
  // console.log("CU ", currUser);
  usersocketIds.set(currUser?._id.toString(), socket.id);

  socket.on("NEW_MESSAGE", async ({ chatId, members, message }) => {
    const realtimemsg = {
      chat: chatId,
      _id: uuid(),
      content: message,
      sender: {
        _id: currUser._id,
        name: currUser.name,
      },
      createdAt: new Date()
    };

    try {
      await Message.create({
        content: message,
        chat: chatId,
        sender: currUser._id
      });
    } catch (error) {
      console.log(error.message);
    }

    const userSockets = getAllSockets(members, usersocketIds);
    io.to(userSockets).emit("NEW_MESSAGE", { chatId, message: realtimemsg });
    io.to(userSockets).emit("NOTIFICATION", { chatId });
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
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

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

export { usersocketIds };

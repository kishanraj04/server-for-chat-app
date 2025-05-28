import express from "express";
import { userRoute } from "./routes/user.route.js";
import "./connectdb/connectdb.js";
import { uploadAvatar } from "./middleware/upload.js";
import './utils/createfolder.js'
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
const app = express();

// parse body
app.use(express.json());

// cookie parser
app.use(cookieParser())

// user route
app.use("/api/v1/user", uploadAvatar, userRoute);

// err handler
app.use(errorHandler)

app.listen(3000, () => {
  console.log("sever listen on 3000");
});

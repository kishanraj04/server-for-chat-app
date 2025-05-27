import express from "express";
import { userRoute } from "./routes/user.route.js";
import "./connectdb/connectdb.js";
import { uploadAvatar } from "./middleware/upload.js";
import './utils/createfolder.js'
const app = express();

// parse body
app.use(express.json());


// user route
app.use("/api/v1/user", uploadAvatar, userRoute);

app.listen(3000, () => {
  console.log("sever listen on 3000");
});

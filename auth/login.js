import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// login
export const isAuthenticated = async (req, res) => {
  const { name, password } = req?.body;

  const isExistUser = await User.findOne({ name: name }).select("+password");
  if (!isExistUser) {
    return res.status(404).json({ success: false, message: "user not found" });
  }

  const isCorrect = await bcrypt.compare(password, isExistUser?.password);

  if (!isCorrect) {
    return res
      .status(401)
      .json({ success: false, message: "unauthozized access" });
  } else {
    const token = jwt.sign({ name: name }, process.env.JWT_SECRATE);
    res
      .status(200).cookie("token",token,{
        httpOnly:true,
        sameSite:"none",
        maxAge: 24 * 60 * 60 * 1000
      })
      .json({ success: true, message: "login successfully", token });
  }
};

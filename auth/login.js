import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// login
export const isLogin = async (req, res, next) => {
  try {
     const { name, password } = req?.body;
  const error = new Error();
  const isExistUser = await User.findOne({ name: name }).select("+password");
  if (!isExistUser) {
    error.message = "Invalid credentials";
    error.status = 401;
    return next(error);
  }

  const isCorrect = await bcrypt.compare(password, isExistUser?.password);

  
  if (!isCorrect) {
    return next(error);
  } else {
    const token = jwt.sign({ name: name,_id:isExistUser?._id }, process.env.JWT_SECRATE);
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ success: true, message: "login successfully", token });
  }
  } catch (error) {
    next(error) 
  }
};

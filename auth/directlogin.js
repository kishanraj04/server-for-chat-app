import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';

// direct login
export const directLogin = async (req, res) => {
  try {
    // Get token from cookie or header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRATE);

    // Find user from decoded token
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Direct login successful",
      user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


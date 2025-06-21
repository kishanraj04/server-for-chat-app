import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// is authenticated
export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    const err = new Error();
    err.message = "unauthorized user";
    err.status = 401;
    return next(err);
  }

  const decode = await jwt.verify(token, process.env.JWT_SECRATE);

  req.user = decode;
  next();
};

// is authenticated
export const isAuthenticatedAdmin = async (req, res, next) => {
  const token = req.cookies.admintoken;
  // console.log(token);
  if (!token) {
    const err = new Error();
    err.message = "unauthorized user";
    err.status = 401;
    return next(err);
  }

  const decode = await jwt.verify(token, process.env.ADMINKEY);
  // console.log(decode);
  req.user = decode;
  next();
};

// logout user
export const logoutUser = async (req, res, next) => {
  const token = req.cookies.token;
  // console.log("toke ",token);
  if (!token) {
    const err = new Error();
    err.message = "user already logout";
    err.statue = 200;
    return next(err);
  }
  res
    .status(200)
    .clearCookie("token", "")
    .json({ success: true, message: "user logout" });
};

// socket authenticator
export const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) {
      const err = new Error();
      err.status = 500;
      err.message = "please login to access the resource";
      return next(err);
    }

    const authtoken = socket.request.cookies.token;
    //    console.log(authtoken);
    if (!authtoken) {
      const err = new Error();
      err.status = 401;
      err.message = "please login to access this resource";
      return next(err);
    }

    const decodedToken = jwt.verify(authtoken, process.env.JWT_SECRATE);
    //    console.log("decode ",decodedToken?._id);

    const user = await User.findById({ _id: decodedToken?._id });

    if (!user) {
      const err = new Error();
      err.status = 404;
      err.message = "unauthorized";
      return next(err);
    }
    socket.user1 = user;

    // console.log("Socket cookies: ", socket.request.cookies);
    // console.log("Authtoken: ", authtoken);
    // console.log("User: ", user);
    next();
  } catch (error) {
    const err = new Error();
    err.status = 500;
    err.message = error.message;
    return next(err);
  }
};

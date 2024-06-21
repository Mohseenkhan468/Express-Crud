import jwt from "jsonwebtoken";
import UserModel from "../models/user.schema.js";
import mongoose from "mongoose";
const userMiddleware = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }
    const decodeToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(decodeToken)
    if (decodeToken?._id && decodeToken.role == "user") {
      const user = await UserModel.findById(decodeToken._id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed.",
        });
      } else {
        req.userObj = user;
        next();
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export default userMiddleware;

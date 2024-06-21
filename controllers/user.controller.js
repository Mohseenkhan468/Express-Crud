import UserModel from "../models/user.schema.js";
import Otpmodel from "../models/otp.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import OtpModel from "../models/otp.schema.js";
import sendMail from "../helpers/nodemailer.helper.js";
import fs from "fs";
class UserController {
  static signup = async (req, res) => {
    try {
      const { first_name, last_name, email, password, phone_number } = req.body;
      const validateSchema = Joi.object({
        first_name: Joi.string().min(3).required(),
        last_name: Joi.string().min(3),
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(8)
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
          .required(),
        phone_number: Joi.string().required(),
      });
      const { error, value } = validateSchema.validate(
        {
          first_name,
          last_name,
          email,
          password,
          phone_number,
        },
        { abortEarly: false }
      );
      const joiError = error?.details?.map((item) => item?.message);
      if (joiError) {
        return res.status(400).json({
          success: false,
          message: joiError,
        });
      }
      const user = await UserModel.findOne({
        $or: [{ email }, { phone_number }],
      });
      if (user) {
        if (user.email === email) {
          return res.status(400).json({
            success: false,
            message: "This email has already been taken.",
          });
        } else if (user.phone_number === phone_number) {
          return res.status(400).json({
            success: false,
            message: "This phone number has already been taken.",
          });
        }
      }
      const hashed_password = await bcrypt.hash(
        password,
        await bcrypt.genSalt(10)
      );
      const newUser = await UserModel.create({
        first_name,
        last_name,
        email,
        password: hashed_password,
        phone_number,
      });
      await Otpmodel.create({
        type: "email",
        action: "verify_email",
        email,
        otp: 123456,
        expire_at: new Date().getTime() + 2 * 60000,
      });
      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: newUser,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  static verifyEmail = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const validateSchema = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.number().min(100000).max(999999).required(),
      });
      const { error, value } = validateSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const joiError = error?.details?.map((item) => item?.message);
        if (joiError) {
          return res.status(400).json({
            success: false,
            message: joiError,
          });
        }
      }
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email provided.",
        });
      }
      const otpData = await Otpmodel.findOne({
        email,
        action: "verify_email",
        expire_at: { $gte: new Date() },
      });
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: "Otp not found, Please send otp first.",
        });
      }
      if (otpData.otp !== 123456) {
        return res.status(400).json({
          success: false,
          message: "Invalid otp provided.",
        });
      }
      const updateUser = await UserModel.findOneAndUpdate(
        { email },
        { $set: { email_verified_at: new Date() } },
        { new: true }
      );
      await Otpmodel.deleteOne({ _id: otpData._id });
      const payload = {
        _id: user._id,
        role: "user",
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "12h",
      });
      const userData = updateUser.toObject();
      delete userData.password;
      return res.status(201).json({
        success: true,
        message: "Email has been verified successfully.",
        data: { ...userData },
        token,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  static resendOtp = async (req, res) => {
    try {
      const { type, action, email, phone_number } = req.body;
      const validateSchema = Joi.object({
        type: Joi.string().valid("email", "phone_number").required(),
        email: Joi.string().email().when("type", {
          is: "email",
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
        phone_number: Joi.string()
          .pattern(/^[0-9]{10}$/)
          .when("type", {
            is: "phone_number",
            then: Joi.required(),
            otherwise: Joi.forbidden(),
          }),
        action: Joi.string()
          .valid("verify_email", "verify_phone_number")
          .required(),
      });
      const { error, value } = validateSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const joiError = error?.details?.map((item) => item?.message);
        if (joiError) {
          return res.status(400).json({
            success: false,
            message: joiError,
          });
        }
      }
      const username = type == "email" ? email : phone_number;
      const user = await UserModel.findOne({
        $or: [{ email: username }, { phone_number: username }],
      });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not exists.",
        });
      }
      const findObj =
        type == "email"
          ? { type, email, action }
          : { type, phone_number, action };
      const otpData = await OtpModel.findOne({
        ...findObj,
        expire_at: { $gte: new Date() },
      });
      if (otpData) {
        return res.status(400).json({
          success: false,
          message: "Otp already sent, please wait.",
        });
      }
      await OtpModel.create({
        type,
        email,
        phone_number,
        action,
        otp: 123456,
        expire_at: new Date().getTime() + 2 * 60000,
      });
      return res.status(201).json({
        success: true,
        message: "Otp sent successfully.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const validateSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      });
      const { error, value } = validateSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const joiError = error?.details?.map((item) => item?.message);
        if (joiError) {
          return res.status(400).json({
            success: false,
            message: joiError,
          });
        }
      }
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "This email is not registered.",
        });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Invalid password.",
        });
      }
      const payload = {
        _id: user._id,
        role: "user",
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "12h",
      });
      const userData = user.toObject();
      delete userData.password;
      if (!user.email_verified_at) {
        const otpData = await OtpModel.findOne({
          type: "email",
          action: "verify_email",
          email,
          expire_at: { $gte: new Date() },
        });
        if (!otpData) {
          await Otpmodel.create({
            type: "email",
            action: "verify_email",
            email,
            expire_at: new Date().getTime() + 2 * 60000,
          });
        }
        return res.status(200).json({
          success: true,
          message: "Please verify your email.",
          screen: "verify_email",
        });
      }
      return res.status(201).json({
        success: true,
        data: { ...userData },
        token,
        screen: "home",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  static uploadProfile = async (req, res) => {
    try {
      if (req.fileValidationError) {
        return res.status(400).json({
          success: false,
          message: req.fileValidationError,
        });
      }
      if (!req?.file) {
        return res.status(400).json({
          success: false,
          message: "File is required.",
        });
      }
      if (
        req.userObj.profile_path &&
        (await fs.existsSync(req.userObj.profile_path))
      ) {
        await fs.unlinkSync(req.userObj.profile_path);
      }
      const baseUrl = `${req.protocol}://${req.headers.host}/`;
      await UserModel.updateOne(
        { _id: req.userObj._id },
        { $set: { profile_url: baseUrl, profile_path: req.file.path } }
      );
      return res.status(201).json({
        success: true,
        message: "Profile updated successfully.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
}

export default UserController;

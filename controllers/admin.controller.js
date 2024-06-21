import { AdminModel } from "../models/admin.schema.js";
import Joi from "joi";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
class AdminController {
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const validateSchema = Joi.object({
        email: Joi.string().required(),
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
      const admin = await AdminModel.findOne({ email });
      console.log(admin);
      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Invalid email provided.",
        });
      }
      const comparePassword = await bcryptjs.compare(password, admin.password);
      if (!comparePassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid password.",
        });
      }
      const payload = {
        _id: admin._id,
        role: "admin",
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "12h",
      });
      return res.status(201).json({
        success: true,
        data: admin,
        token,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
}
export default AdminController;

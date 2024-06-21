import express from "express";
const router = express.Router();
import UserController from "../controllers/user.controller.js";
import userMiddleware from "../middlewares/user.middleware.js";
import { extname } from "path";
import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    console.log(ext);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(jpg|jpeg|JPEG|png)$/)) {
      cb(null, true);
    } else {
      req.fileValidationError = "Only images allowed";
      cb(null, false);
    }
  },
});
router.post("/signup", UserController.signup);
router.post("/verify_email", UserController.verifyEmail);
router.post("/resend_otp", UserController.resendOtp);
router.post("/login", UserController.login);
router.post(
  "/upload_profile",
  userMiddleware,
  upload.single("profile"),
  UserController.uploadProfile
);
export default router;

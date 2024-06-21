import mongoose from "mongoose";
const otpSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "",
      enum: ["email", "phone_number"],
      required: true,
    },
    action: {
      type: String,
      default: "",
      enum: ["verify_email", "verify_phone_number"],
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    phone_number: {
      type: String,
      default: "",
    },
    otp: {
      type: Number,
      default: null,
      required: true,
    },
    expire_at: {
      type: Date,
      default: null,
      required: true,
    },
  },
  { timestamps: true }
);
const OtpModel = mongoose.model("otp", otpSchema);
export default OtpModel;

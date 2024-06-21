import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase:true
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email_verified_at: {
      type: Date,
      default: null,
    },
    phone_number_verified_at: {
      type: Date,
      default: null,
    },
    profile_path: {
      type: String,
      default: "",
    },
    profile_url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
const UserModel = mongoose.model("user", userSchema);
export default UserModel;

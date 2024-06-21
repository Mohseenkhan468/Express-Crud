import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    lowercase: true,
  },
});
const AdminModel = mongoose.model("admin", adminSchema);
const initializeAdmin = async () => {
  try {
    const admin = await AdminModel.findOne();
    if (!admin) {
      const hashed_password = await bcryptjs.hash("admin@123", 10);
      await new AdminModel({
        email: "admin@admin.com",
        password: hashed_password,
      }).save();
      console.log("admin initialize");
    }
  } catch (err) {
    console.log(err);
  }
};
export default initializeAdmin;
export { AdminModel };

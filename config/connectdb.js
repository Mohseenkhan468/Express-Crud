import mongoose from "mongoose";
const connectDb = async (DB_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "expresscruddb",
    };
    await mongoose.connect(DB_URL, DB_OPTIONS);
    console.log('Connected successfully.')
  } catch (err) {
    console.log("Error in connection database", err.message);
  }
};
export default connectDb

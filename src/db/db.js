import mongoose from "mongoose";

const connectDb = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // optionally specify dbName here if not in URI
      // dbName: "LeaveMS",
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error; // rethrow for upstream catch
  }
};

export default connectDb;

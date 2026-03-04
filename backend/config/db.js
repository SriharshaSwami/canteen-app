import { connect } from "mongoose";

//DB connection logic
const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("DB connection successful!");
  } catch (error) {
    console.error("Database connection failed");
    process.exit(1);
  }
};

export default connectDB;
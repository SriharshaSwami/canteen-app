import { connect } from "mongoose";
import bcrypt from "bcryptjs";

//DB connection logic
const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("DB connection successful!");
    
    // Auto-seed demo users on startup
    await seedDemoUsers();
  } catch (error) {
    console.error("Database connection failed");
    process.exit(1);
  }
};

// Seed demo users if they don't exist
const seedDemoUsers = async () => {
  try {
    // Dynamic import to avoid circular dependency
    const User = (await import("../models/userModel.js")).default;
    
    const demoUsers = [
      {
        name: "Canteen Admin",
        email: "admin@canteen.com",
        password: "admin123",
        role: "admin",
        creditBalance: 1000
      },
      {
        name: "Test User",
        email: "user@canteen.com",
        password: "user123",
        role: "user",
        creditBalance: 500
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        await User.create({
          ...userData,
          password: hashedPassword
        });
        
        console.log(`Created demo ${userData.role}: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error("Error seeding demo users:", error.message);
  }
};

export default connectDB;
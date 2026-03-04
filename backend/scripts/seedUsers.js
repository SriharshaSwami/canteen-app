import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import User model
import User from "../models/userModel.js";

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Seed data
    const users = [
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

    let created = 0;
    let skipped = 0;

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists - skipping`);
        skipped++;
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      await User.create({
        ...userData,
        password: hashedPassword
      });

      console.log(`Created ${userData.role}: ${userData.email}`);
      created++;
    }

    console.log("\n--- Seed Summary ---");
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log("\nDefault credentials:");
    console.log("Admin: admin@canteen.com / admin123");
    console.log("User: user@canteen.com / user123");

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedUsers();

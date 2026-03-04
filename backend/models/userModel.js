import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    creditBalance: {
      type: Number,
      default: 0,
      min: [0, "Credit balance cannot be negative"]
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized queries
// Note: email index is already created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("user", userSchema);

export default User;
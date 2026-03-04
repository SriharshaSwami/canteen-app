import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    mealName: {
      type: String,
      required: [true, "Meal name is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    available: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: [true, "Category is required"]
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, "Stock cannot be negative"]
    },
    dailyLimit: {
      type: Number,
      default: 100,
      min: [0, "Daily limit cannot be negative"]
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized queries
menuSchema.index({ category: 1 });
menuSchema.index({ available: 1 });
menuSchema.index({ price: 1 });
menuSchema.index({ category: 1, available: 1 }); // Compound index for filtered queries

const Menu = mongoose.model("menu", menuSchema);

export default Menu;

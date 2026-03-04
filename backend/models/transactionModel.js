import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"]
    },
    type: {
      type: String,
      enum: ["credit_added", "meal_purchase"],
      required: [true, "Transaction type is required"]
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"]
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menu",
      default: null
    },
    balanceAfter: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ mealId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user transactions

const Transaction = mongoose.model("transaction", transactionSchema);

export default Transaction;

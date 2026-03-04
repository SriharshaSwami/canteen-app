import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "menu",
    required: true
  },
  mealName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"]
  },
  price: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"]
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "Order must have at least one item"
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"]
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "preparing", "ready", "completed", "cancelled"],
      default: "pending"
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ["pending", "accepted", "preparing", "ready", "completed", "cancelled"]
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    }],
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized queries
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("order", orderSchema);

export default Order;

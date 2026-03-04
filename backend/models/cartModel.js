import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "menu",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Calculate total before saving
cartSchema.pre("save", function () {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Index for user lookup - removed duplicate (userId already has unique: true)
// cartSchema.index({ userId: 1 });

const Cart = mongoose.model("cart", cartSchema);

export default Cart;

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["new_order", "order_accepted", "order_ready", "order_completed", "order_cancelled", "credits_added", "system"],
      default: "system"
    },
    read: {
      type: Boolean,
      default: false
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order"
    }
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;

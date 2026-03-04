import Notification from "../models/notificationModel.js";
import { sendSuccess } from "../utils/responseHelper.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    sendSuccess(res, { notifications, unreadCount }, "Notifications retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    sendSuccess(res, notification, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    sendSuccess(res, null, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to create notifications (for use in other controllers)
 */
export const createNotification = async (userId, message, type, relatedOrder = null) => {
  try {
    await Notification.create({
      userId,
      message,
      type,
      relatedOrder
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

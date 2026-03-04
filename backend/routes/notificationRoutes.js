import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user's notifications
 */
router.get("/my", getMyNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 */
router.patch("/read-all", markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 */
router.patch("/:id/read", markAsRead);

export default router;

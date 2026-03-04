import express from "express";
import { getAdminStats, getRevenueAnalytics } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 */
router.get("/stats", getAdminStats);

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     tags: [Admin]
 *     summary: Get revenue analytics
 */
router.get("/revenue", getRevenueAnalytics);

export default router;

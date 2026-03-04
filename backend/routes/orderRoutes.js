import express from "express";
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, validateQuery, orderSchemas, querySchemas } from "../middleware/validateMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user's orders
 */
router.get("/my", validateQuery(querySchemas.orderFilter), getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel own order (only if pending)
 */
router.patch("/:id/cancel", cancelOrder);

// Admin routes
/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders (Admin only)
 */
router.get("/", admin, validateQuery(querySchemas.orderFilter), getAllOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (Admin only)
 */
router.patch("/:id/status", admin, validate(orderSchemas.updateStatus), updateOrderStatus);

export default router;

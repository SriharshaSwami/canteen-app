import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendPaginated, paginate } from "../utils/responseHelper.js";
import { createNotification } from "./notificationController.js";

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, preparing, ready, completed, cancelled]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery || req.query;
    const { page = 1, limit = 10, status } = queryParams;

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const result = await paginate(Order, query, {
      page,
      limit,
      sort: "-createdAt"
    });

    sendPaginated(res, result, "Orders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.menuItemId", "mealName category");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Users can only view their own orders, admins can view all
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new ApiError(403, "Not authorized to view this order");
    }

    sendSuccess(res, order, "Order retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, preparing, ready, completed, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All orders retrieved successfully
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery || req.query;
    const { page = 1, limit = 10, status, userId } = queryParams;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const result = await paginate(Order, query, {
      page,
      limit,
      sort: "-createdAt",
      populate: { path: "userId", select: "name email" }
    });

    sendPaginated(res, result, "All orders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, preparing, ready, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "preparing", "ready", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Prevent status changes for completed or cancelled orders
    if (order.status === "completed" || order.status === "cancelled") {
      throw new ApiError(400, `Cannot change status of ${order.status} order`);
    }

    // Handle cancellation - refund credits
    if (status === "cancelled" && order.status !== "cancelled") {
      const user = await User.findById(order.userId);
      if (user) {
        user.creditBalance += order.totalAmount;
        await user.save();

        // Create refund transaction
        await Transaction.create({
          userId: user._id,
          type: "credit_added",
          amount: order.totalAmount,
          description: `Refund for cancelled order #${order._id.toString().slice(-6)}`,
          balanceAfter: user.creditBalance
        });
      }
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id
    });

    await order.save();

    // Create notification for the user
    const notificationMessages = {
      accepted: `Your order #${order._id.toString().slice(-6)} has been accepted!`,
      preparing: `Your order #${order._id.toString().slice(-6)} is being prepared.`,
      ready: `Your order #${order._id.toString().slice(-6)} is ready for pickup!`,
      completed: `Your order #${order._id.toString().slice(-6)} has been completed.`,
      cancelled: `Your order #${order._id.toString().slice(-6)} has been cancelled. Credits refunded.`
    };

    if (notificationMessages[status]) {
      await createNotification(
        order.userId,
        notificationMessages[status],
        `order_${status}`,
        order._id
      );
    }

    sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel own order (only if pending)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized to cancel this order");
    }

    // Can only cancel pending orders
    if (order.status !== "pending") {
      throw new ApiError(400, "Can only cancel pending orders");
    }

    // Refund credits
    const user = await User.findById(order.userId);
    user.creditBalance += order.totalAmount;
    await user.save();

    // Create refund transaction
    await Transaction.create({
      userId: user._id,
      type: "credit_added",
      amount: order.totalAmount,
      description: `Refund for cancelled order #${order._id.toString().slice(-6)}`,
      balanceAfter: user.creditBalance
    });

    // Update order
    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      changedAt: new Date(),
      changedBy: req.user._id
    });

    await order.save();

    sendSuccess(res, { order, newBalance: user.creditBalance }, "Order cancelled and refunded");
  } catch (error) {
    next(error);
  }
};

import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Transaction from "../models/transactionModel.js";
import { sendSuccess } from "../utils/responseHelper.js";

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
export const getAdminStats = async (req, res, next) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalOrders,
      revenueResult,
      todayOrders,
      pendingOrders,
      ordersByStatus,
      recentOrders,
      topMenuItems
    ] = await Promise.all([
      // Total users (excluding admins)
      User.countDocuments({ role: "user" }),
      
      // Total orders
      Order.countDocuments(),
      
      // Total revenue from completed orders
      Order.aggregate([
        { $match: { status: { $in: ["completed", "ready", "preparing", "accepted"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      
      // Today's orders
      Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Pending orders
      Order.countDocuments({ status: "pending" }),
      
      // Orders by status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      // Recent 5 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email")
        .select("totalAmount status createdAt items"),
      
      // Top selling menu items
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.mealName", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Format orders by status into an object
    const statusCounts = {};
    ordersByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    sendSuccess(res, {
      totalUsers,
      totalOrders,
      totalRevenue,
      todayOrders,
      pendingOrders,
      ordersByStatus: statusCounts,
      recentOrders,
      topMenuItems
    }, "Admin statistics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data retrieved successfully
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    // Last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, { dailyRevenue }, "Revenue analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

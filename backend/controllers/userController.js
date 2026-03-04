import User from "../models/userModel.js";
import { sendSuccess } from "../utils/responseHelper.js";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Get all non-admin users for credits dropdown
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('_id name email creditBalance')
      .sort({ name: 1 });
    sendSuccess(res, { users }, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Not authorized
 */
export const getProfile = async (req, res, next) => {
  try {
    sendSuccess(res, req.user, "Profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

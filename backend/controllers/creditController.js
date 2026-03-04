import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendPaginated, paginate } from "../utils/responseHelper.js";
import { createNotification } from "./notificationController.js";

/**
 * @swagger
 * /api/credits/add:
 *   post:
 *     summary: Add credits to user account
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credits added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 */
export const addCredits = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update credit balance
    user.creditBalance += amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: "credit_added",
      amount,
      description: description || "Credits added by admin",
      balanceAfter: user.creditBalance
    });

    // Create notification for the user
    await createNotification(
      user._id,
      `Rs ${amount} credits have been added to your account. New balance: Rs ${user.creditBalance}`,
      "credits_added"
    );

    sendSuccess(res, {
      creditBalance: user.creditBalance,
      transaction
    }, "Credits added successfully");

  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/credits/balance:
 *   get:
 *     summary: Get user's credit balance
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit balance retrieved
 *       401:
 *         description: Not authorized
 */
export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, { creditBalance: user.creditBalance });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/credits/transactions:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Credits]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit_added, meal_purchase]
 *     responses:
 *       200:
 *         description: Transaction history retrieved
 *       401:
 *         description: Not authorized
 */
export const getTransactions = async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery || req.query;
    const { page = 1, limit = 10, type } = queryParams;
    
    const query = { userId: req.user._id };
    if (type) query.type = type;

    const result = await paginate(Transaction, query, {
      page,
      limit,
      sort: '-createdAt',
      populate: { path: 'mealId', select: 'mealName price category' }
    });

    sendPaginated(res, result, "Transactions retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/credits/all-transactions:
 *   get:
 *     summary: Get all transactions (Admin only)
 *     tags: [Credits]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit_added, meal_purchase]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All transactions retrieved
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 */
export const getAllTransactions = async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery || req.query;
    const { page = 1, limit = 10, type, userId } = queryParams;
    
    const query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;

    const result = await paginate(Transaction, query, {
      page,
      limit,
      sort: '-createdAt',
      populate: [
        { path: 'userId', select: 'name email' },
        { path: 'mealId', select: 'mealName price category' }
      ]
    });

    sendPaginated(res, result, "All transactions retrieved successfully");
  } catch (error) {
    next(error);
  }
};

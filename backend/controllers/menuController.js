import Menu from "../models/menuModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendCreated, sendPaginated, paginate } from "../utils/responseHelper.js";

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menu]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snacks]
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price, -price, mealName, -mealName, category]
 *     responses:
 *       200:
 *         description: Menu items retrieved
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery || req.query;
    const { page = 1, limit = 10, category, available, sort = 'category' } = queryParams;
    
    const query = {};
    if (category) query.category = category;
    if (available !== undefined) query.available = available === 'true';

    const result = await paginate(Menu, query, { page, limit, sort });

    sendPaginated(res, result, "Menu items retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     summary: Get single menu item
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item retrieved
 *       404:
 *         description: Menu item not found
 */
export const getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      throw new ApiError(404, "Menu item not found");
    }
    sendSuccess(res, menuItem);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/menu:
 *   post:
 *     summary: Create a menu item (Admin only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealName
 *               - price
 *               - category
 *             properties:
 *               mealName:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snacks]
 *               description:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu item created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const { mealName, price, category, description, available } = req.body;

    const menuItem = await Menu.create({
      mealName,
      price,
      category,
      description,
      available
    });

    sendCreated(res, menuItem, "Menu item created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     summary: Update a menu item (Admin only)
 *     tags: [Menu]
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
 *             properties:
 *               mealName:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu item updated
 *       404:
 *         description: Menu item not found
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const { mealName, price, category, description, available } = req.body;

    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      throw new ApiError(404, "Menu item not found");
    }

    menuItem.mealName = mealName || menuItem.mealName;
    menuItem.price = price !== undefined ? price : menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.description = description !== undefined ? description : menuItem.description;
    menuItem.available = available !== undefined ? available : menuItem.available;

    const updatedMenuItem = await menuItem.save();
    sendSuccess(res, updatedMenuItem, "Menu item updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     summary: Delete a menu item (Admin only)
 *     tags: [Menu]
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
 *         description: Menu item deleted
 *       404:
 *         description: Menu item not found
 */
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      throw new ApiError(404, "Menu item not found");
    }

    await Menu.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, "Menu item removed successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/menu/{id}/availability:
 *   patch:
 *     summary: Toggle meal availability (Admin only)
 *     tags: [Menu]
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
 *         description: Availability toggled
 *       404:
 *         description: Menu item not found
 */
export const toggleAvailability = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      throw new ApiError(404, "Menu item not found");
    }

    // Accept value from request body, otherwise toggle
    if (req.body.available !== undefined) {
      menuItem.available = req.body.available;
    } else {
      menuItem.available = !menuItem.available;
    }
    await menuItem.save();

    sendSuccess(res, { available: menuItem.available }, 
      `Meal availability set to ${menuItem.available}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/menu/{id}/purchase:
 *   post:
 *     summary: Purchase a meal
 *     tags: [Menu]
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
 *         description: Meal purchased successfully
 *       400:
 *         description: Insufficient credits or meal unavailable
 *       404:
 *         description: Meal not found
 */
export const purchaseMeal = async (req, res, next) => {
  try {
    // Find the meal
    const meal = await Menu.findById(req.params.id);
    if (!meal) {
      throw new ApiError(404, "Meal not found");
    }

    // Check if meal is available
    if (!meal.available) {
      throw new ApiError(400, "This meal is currently unavailable");
    }

    // Find the user
    const user = await User.findById(req.user._id);

    // Check if user has sufficient credits
    if (user.creditBalance < meal.price) {
      throw new ApiError(400, `Insufficient credits. Required: ${meal.price}, Available: ${user.creditBalance}`);
    }

    // Deduct credits
    user.creditBalance -= meal.price;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: "meal_purchase",
      amount: meal.price,
      description: `Purchased ${meal.mealName}`,
      mealId: meal._id,
      balanceAfter: user.creditBalance
    });

    sendSuccess(res, {
      meal: {
        name: meal.mealName,
        price: meal.price,
        category: meal.category
      },
      creditBalance: user.creditBalance,
      transaction
    }, "Meal purchased successfully");

  } catch (error) {
    next(error);
  }
};


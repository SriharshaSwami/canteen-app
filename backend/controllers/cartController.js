import Cart from "../models/cartModel.js";
import Menu from "../models/menuModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Transaction from "../models/transactionModel.js";
import Notification from "../models/notificationModel.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendCreated } from "../utils/responseHelper.js";

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.menuItemId", "mealName price category available");

    if (!cart) {
      cart = { items: [], totalAmount: 0 };
    }

    sendSuccess(res, cart, "Cart retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *             properties:
 *               menuItemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added to cart
 */
export const addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    // Validate menu item exists and is available
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      throw new ApiError(404, "Menu item not found");
    }
    if (!menuItem.available) {
      throw new ApiError(400, "Menu item is not available");
    }
    if (menuItem.stock < quantity) {
      throw new ApiError(400, `Insufficient stock. Only ${menuItem.stock} available`);
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: []
      });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      // Check if total quantity exceeds stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > menuItem.stock) {
        throw new ApiError(400, `Cannot add more. Stock limit: ${menuItem.stock}`);
      }
      // Update quantity
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = menuItem.price;
    } else {
      // Add new item
      cart.items.push({
        menuItemId,
        quantity,
        price: menuItem.price
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate("items.menuItemId", "mealName price category available stock");

    sendSuccess(res, cart, "Item added to cart");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cart/update:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *               - quantity
 *             properties:
 *               menuItemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (itemIndex === -1) {
      throw new ApiError(404, "Item not found in cart");
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.menuItemId", "mealName price category available");

    sendSuccess(res, cart, "Cart updated");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cart/remove/{menuItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (itemIndex === -1) {
      throw new ApiError(404, "Item not found in cart");
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate("items.menuItemId", "mealName price category available");

    sendSuccess(res, cart, "Item removed from cart");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    sendSuccess(res, { items: [], totalAmount: 0 }, "Cart cleared");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cart/checkout:
 *   post:
 *     summary: Checkout cart and create order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
export const checkout = async (req, res, next) => {
  try {
    const { notes } = req.body;

    // Get cart with populated items
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.menuItemId", "mealName price category available stock");

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // Validate all items are available and have sufficient stock
    for (const item of cart.items) {
      if (!item.menuItemId) {
        throw new ApiError(400, "One or more menu items no longer exist");
      }
      if (!item.menuItemId.available) {
        throw new ApiError(400, `${item.menuItemId.mealName} is no longer available`);
      }
      if (item.menuItemId.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${item.menuItemId.mealName}. Available: ${item.menuItemId.stock}`);
      }
    }

    // Calculate total with current prices
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const subtotal = item.menuItemId.price * item.quantity;
      totalAmount += subtotal;
      return {
        menuItemId: item.menuItemId._id,
        mealName: item.menuItemId.mealName,
        quantity: item.quantity,
        price: item.menuItemId.price,
        subtotal
      };
    });

    // Check user balance
    const user = await User.findById(req.user._id);
    if (user.creditBalance < totalAmount) {
      throw new ApiError(400, `Insufficient balance. Required: ₹${totalAmount}, Available: ₹${user.creditBalance}`);
    }

    // Reduce stock for each item and auto-disable if stock reaches 0
    for (const item of cart.items) {
      const menuItem = await Menu.findById(item.menuItemId._id);
      menuItem.stock -= item.quantity;
      if (menuItem.stock <= 0) {
        menuItem.stock = 0;
        menuItem.available = false;
      }
      await menuItem.save();
    }

    // Deduct credits
    user.creditBalance -= totalAmount;
    await user.save();

    // Create transaction
    const transaction = await Transaction.create({
      userId: user._id,
      type: "meal_purchase",
      amount: totalAmount,
      description: `Order: ${orderItems.map(i => `${i.mealName} x${i.quantity}`).join(", ")}`,
      balanceAfter: user.creditBalance
    });

    // Create order
    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      totalAmount,
      status: "pending",
      statusHistory: [{
        status: "pending",
        changedAt: new Date(),
        changedBy: user._id
      }],
      transactionId: transaction._id,
      notes
    });

    // Clear cart
    await Cart.findOneAndDelete({ userId: req.user._id });

    // Notify all admin users about the new order
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const adminNotifications = adminUsers.map(admin => ({
      userId: admin._id,
      type: 'new_order',
      message: `New order #${order._id.toString().slice(-6)} from ${user.name} - ₹${totalAmount}`,
      relatedOrder: order._id
    }));
    if (adminNotifications.length > 0) {
      await Notification.insertMany(adminNotifications);
    }

    sendCreated(res, {
      order,
      newBalance: user.creditBalance,
      transaction
    }, "Order placed successfully");
  } catch (error) {
    next(error);
  }
};

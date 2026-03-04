import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate, cartSchemas } from "../middleware/validateMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get user's cart
 */
router.get("/", getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 */
router.post("/add", validate(cartSchemas.addItem), addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   patch:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 */
router.patch("/update", validate(cartSchemas.updateItem), updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{menuItemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 */
router.delete("/remove/:menuItemId", removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear entire cart
 */
router.delete("/clear", clearCart);

/**
 * @swagger
 * /api/cart/checkout:
 *   post:
 *     tags: [Cart]
 *     summary: Checkout cart and create order
 */
router.post("/checkout", validate(cartSchemas.checkout), checkout);

export default router;

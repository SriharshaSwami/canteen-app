import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate, authSchemas } from "../middleware/validateMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 */
router.post("/register", validate(authSchemas.register), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 */
router.post("/login", validate(authSchemas.login), loginUser);

export default router;
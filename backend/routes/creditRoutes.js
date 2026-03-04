import express from "express";
import { 
  addCredits, 
  getBalance, 
  getTransactions,
  getAllTransactions 
} from "../controllers/creditController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, validateQuery, creditSchemas, querySchemas } from "../middleware/validateMiddleware.js";

const router = express.Router();

// Protected routes (logged-in users)
router.get("/balance", protect, getBalance);
router.get("/transactions", protect, validateQuery(querySchemas.pagination), getTransactions);

// Admin only routes
router.post("/add", protect, admin, validate(creditSchemas.addCredits), addCredits);
router.get("/all-transactions", protect, admin, validateQuery(querySchemas.pagination), getAllTransactions);

export default router;

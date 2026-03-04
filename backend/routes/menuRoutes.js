import express from "express";
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  purchaseMeal
} from "../controllers/menuController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, validateQuery, menuSchemas, querySchemas } from "../middleware/validateMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", validateQuery(querySchemas.menuFilter), getMenuItems);
router.get("/:id", getMenuItem);

// Protected routes (logged-in users)
router.post("/:id/purchase", protect, purchaseMeal);

// Admin only routes
router.post("/", protect, admin, validate(menuSchemas.create), createMenuItem);
router.put("/:id", protect, admin, validate(menuSchemas.update), updateMenuItem);
router.delete("/:id", protect, admin, deleteMenuItem);
router.patch("/:id/availability", protect, admin, toggleAvailability);

export default router;

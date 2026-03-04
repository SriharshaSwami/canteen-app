import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { ApiError } from "./errorMiddleware.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        throw new ApiError(401, "User not found");
      }

      next();
    } else {
      throw new ApiError(401, "No token provided");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(error);
    } else {
      next(new ApiError(401, "Not authorized"));
    }
  }
};

// Admin middleware - must be used after protect middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new ApiError(403, "Access denied. Admin only."));
  }
};
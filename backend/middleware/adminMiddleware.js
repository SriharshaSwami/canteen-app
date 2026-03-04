import { ApiError } from "./errorMiddleware.js";

/**
 * Admin Authorization Middleware
 * 
 * Must be used after the protect middleware (which sets req.user)
 * Checks if the authenticated user has admin role
 * Returns 403 Forbidden if not admin
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Not authorized. Please login."));
  }

  if (req.user.role !== "admin") {
    return next(new ApiError(403, "Forbidden. Admin access required."));
  }

  next();
};

export default adminOnly;

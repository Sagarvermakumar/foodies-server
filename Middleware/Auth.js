import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../Models/User.model.js";
import catchAsyncError from "./CatchAsyncError.js";
import ErrorHandler from "./Error.js";

/**
 * @desc    Middleware to check if the user is authenticated
 * @use     Checks role-based cookies (using last_active_role) and verifies JWT.
 *          Attaches user to req.user
 */
export const isAuthenticate = catchAsyncError(async (req, res, next) => {
  const roleCookieMap = {
    SUPER_ADMIN: "super_admin_token",
    MANAGER: "manager_token",
    STAFF: "staff_token",
    DELIVERY: "delivery_token",
    CUSTOMER: "customer_token",
  };

  // Prefer query param if provided (for UI role selection)
  let role = req.query.role;

  // Fallback to last_active_role cookie
  if (!role && req.cookies.last_active_role) {
    role = req.cookies.last_active_role;
  }

  if (!role || !roleCookieMap[role]) {
    return next(new ErrorHandler("Role required or invalid", 400));
  }

  // Get token for this role
  const token = req.cookies[roleCookieMap[role]];
  if (!token) return next(new ErrorHandler("Token missing for this role", 401));

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  // Check role consistency
  if (decoded.role !== role) {
    return next(new ErrorHandler("Role mismatch. Please select correct role.", 401));
  }

  // Fetch user
  const user = await User.findById(decoded.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Attach user to request
  req.user = user;
  next();
});

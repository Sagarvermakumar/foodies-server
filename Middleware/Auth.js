import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../Models/User.model.js";
import catchAsyncError from "./CatchAsyncError.js";
import ErrorHandler from "./Error.js";

/**
 * @desc    Middleware to check if the user is authenticated
 * @use     Checks role-based cookies and verifies JWT. Attaches user to req.user
 */
export const isAuthenticate = catchAsyncError(async (req, res, next) => {
  // Map of role -> cookie name
  const roleCookieMap = {
    SUPER_ADMIN: "super_admin_token",
    MANAGER: "manager_token",
    STAFF: "staff_token",
    DELIVERY: "delivery_token",
    CUSTOMER: "customer_token",
  };

  // Pick the first valid token from available role cookies
  const token = Object.values(roleCookieMap)
    .map((name) => req.cookies[name])
    .find(Boolean); // first non-null token

  if (!token) {
    return next(new ErrorHandler("You need to login first...", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return next(
      new ErrorHandler("Invalid or expired token. Please login again.", 401)
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  req.user = user;

  next();
});

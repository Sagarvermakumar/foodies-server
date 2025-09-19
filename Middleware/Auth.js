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
  const roleCookieMap = {
    SUPER_ADMIN: "super_admin_token",
    MANAGER: "manager_token",
    STAFF: "staff_token",
    DELIVERY: "delivery_token",
    CUSTOMER: "customer_token",
  };

  // Get token from whichever role cookie exists
  let token, role;
  for (const [roleKey, cookieName] of Object.entries(roleCookieMap)) {
    if (req.cookies[cookieName]) {
      token = req.cookies[cookieName];
      role = roleKey;
      break;
    }
  }

  if (!token) {
    return next(new ErrorHandler("You need to login first...", 401));
  }

  //Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return next(
      new ErrorHandler("Invalid or expired token. Please login again.", 401)
    );
  }

  // Find user
  const user = await User.findById(decoded.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Ensure role from cookie matches user role
  if (user.role !== role) {
    return next(
      new ErrorHandler("Role mismatch. Please login again.", 401)
    );
  }

  req.user = user;
  next();
});


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

  // Get roles to check: query param first, then last_active_role, then all roles
  const rolesToCheck = [];
  if (req.query.role) rolesToCheck.push(req.query.role);
  if (req.cookies.last_active_role && !rolesToCheck.includes(req.cookies.last_active_role)) {
    rolesToCheck.push(req.cookies.last_active_role);
  }
  rolesToCheck.push(...Object.keys(roleCookieMap));

  let user = null;
  let token = null;
  let matchedRole = null;

  for (const role of rolesToCheck) {
    const cookieName = roleCookieMap[role];
    const roleToken = req.cookies[cookieName];
    if (!roleToken) continue;

    try {
      const decoded = jwt.verify(roleToken, config.JWT_SECRET);
      if (decoded.role === role) {
        token = roleToken;
        matchedRole = role;
        user = await User.findById(decoded.id);
        if (user) break; // Stop at first valid match
      }
    } catch (err) {
      continue; // Invalid token, try next
    }
  }

  if (!user || !token) {
    return next(new ErrorHandler("Invalid credentials or no valid token found", 401));
  }

  // Attach user and matchedRole for controller use
  req.user = user;
  req.user.role = matchedRole;
  next();
});


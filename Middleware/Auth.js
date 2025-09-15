import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../Models/User.model.js";
import catchAsyncError from "./CatchAsyncError.js";
import ErrorHandler from "./Error.js";

/**
 * @desc    Middleware to check if the user is authenticated
 * @use     This middleware checks if the user is logged in by verifying the JWT token
 *          stored in cookies. If the token is valid, it attaches the user information to the request object.
 */

export const isAuthenticate = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) return next(new ErrorHandler("You need to login first...", 401));

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET); // agar invalid token hoga to catch me jayega
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token. Please login again.", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  req.user = user;

  next();
});



/**
 * @desc    Rate Limiting Middleware
 * @use     Protects routes from abuse (brute force, DDoS, spam requests)
 * @library express-rate-limit
 */

import rateLimit from "express-rate-limit";

/**
 * @function createRateLimiter
 * @param {Number} windowMs - Time window in ms
 * @param {Number} max - Max requests per window
 * @param {String} message - Custom error message
 * @returns {Function} Express middleware
 */
export const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || "Too many requests, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  });

// ⚡ Ready-to-use limiters
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // 100 requests
  message: "Too many requests from this IP. Please wait 15 minutes.",
});

export const authLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5, // 5 attempts
  message: "Too many login attempts. Please try again after 10 minutes.",
});

export const paymentLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 3, // 3 requests
  message: "Too many payment attempts. Please try again later.",
});

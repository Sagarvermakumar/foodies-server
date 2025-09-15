import { body } from "express-validator";

/**
 * @desc   Validation rules for general push notifications
 */
export const validatePushNotification = [
  body("title").notEmpty().withMessage("Title is required"),
  body("message").notEmpty().withMessage("Message is required"),
];

/**
 * @desc   Validation rules for order notifications
 */
export const validateOrderNotification = [
  body("status").notEmpty().withMessage("Order status is required"),
  body("message").notEmpty().withMessage("Message is required"),
];

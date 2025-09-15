import { body, param } from "express-validator";

export const createItemValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("category").isMongoId().withMessage("Valid category ID required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be positive"),
  body("outlet").isMongoId().withMessage("Valid outlet ID required")
];

export const toggleItemValidator = [
  param("id").isMongoId().withMessage("Valid Item ID required")
];

export const stockUpdateValidator = [
  param("id").isMongoId().withMessage("Valid Item ID required"),
  body("lowStockThreshold").isInt({ min: 0 }).withMessage("Stock threshold must be positive integer")
];

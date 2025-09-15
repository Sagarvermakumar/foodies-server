// validators/categoryValidator.js
import { body, param } from "express-validator";

// Validation for creating a category
export const createCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("description")
    .notEmpty()
    .withMessage("Category Description is required")
    .isLength({ min:  20})
    .withMessage("Name must be at least 20 characters long"),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be true or false"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a positive integer"),
];

// Validation for updating a category
export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID"),
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be true or false"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
];

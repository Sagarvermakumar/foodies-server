import { body, param } from "express-validator";

export const createReviewValidator = [
  body("itemId").notEmpty().withMessage("Item ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString().withMessage("Comment must be text"),
];

export const getReviewsByItemValidator = [
  param("itemId").notEmpty().withMessage("Item ID is required"),
];
export const replyToReviewValidator = [
  param("id").notEmpty().withMessage("Review ID is required"),
  body("reply").notEmpty().withMessage("Reply text is required"),
];

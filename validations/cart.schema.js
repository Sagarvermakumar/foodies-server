import { body, param } from "express-validator";

export const validateAddToCart = [
  body("itemId").isMongoId().withMessage("Valid itemId is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("variation").optional().isObject().withMessage("variation must be a object"),
    body("addons").optional().isArray().withMessage("Addons must be Array")
];

export const validateUpdateCartItem = [
  param("lineId").isMongoId().withMessage("Valid cart lineId is required"),
  body("qty").optional().isInt({ min: 1 }),
  body("variation").optional().isObject(),
  body("addons").optional().isArray(),
];  

export const validateApplyCoupon = [
  body("code").isString().notEmpty().withMessage("Coupon code is required"),
];

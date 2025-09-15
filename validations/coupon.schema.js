import { body, query } from "express-validator";

export const applyCouponValidator = [
  query("code").notEmpty().withMessage("Coupon code is required"),
];

export const createCouponValidator = [
  body("code").notEmpty().withMessage("Code is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("type").isIn(["PERCENT", "FLAT"]).withMessage("Type must be PERCENT or FLAT"),
  body("value").isNumeric().withMessage("Value must be a number"),
  body("minOrder").optional().isNumeric(),
  body("maxDiscount").optional().isNumeric(),
  body("startAt").optional().isISO8601().toDate(),
  body("endAt").optional().isISO8601().toDate(),
];

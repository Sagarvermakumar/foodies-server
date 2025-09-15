import { body, param } from "express-validator";

/**
 * Create Outlet Validator
 */
export const createOutletValidator = [
  body("name")
    .notEmpty().withMessage("Outlet name is required")
    .isString().withMessage("Outlet name must be a string"),

  body("code")
    .optional()
    .isString().withMessage("Code must be a string"),
   body("phone")
    .optional()
    .matches(/^(\+?91[- ]?)?[6-9]\d{9}$/)
    .withMessage("Invalid Indian phone number"),

  body("openingHours.open")
    .optional()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Open time must be in HH:mm format"),

  body("openingHours.close")
    .optional()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Close time must be in HH:mm format"),

  body("openingHours.weeklyOff")
    .optional()
    .isArray({ min: 0, max: 7 })
    .withMessage("Weekly off must be an array of day numbers (0-6)"),

  body("deliveryCharges")
    .optional()
    .isIn(["FIXED", "PER_KM", "FREE_ABOVE"])
    .withMessage("Invalid delivery charge type"),

  body("deliveryConfig.fixed")
    .optional()
    .isNumeric().withMessage("Fixed delivery charge must be a number"),

  body("deliveryConfig.perKm")
    .optional()
    .isNumeric().withMessage("Per km delivery charge must be a number"),

  body("deliveryConfig.freeAbove")
    .optional()
    .isNumeric().withMessage("Free above amount must be a number"),

  body("gstIN")
    .optional()
    .isString().withMessage("GSTIN must be a string")
];

/**
 * Update Outlet Validator
 * - All fields optional, but validated if present
 */
export const updateOutletValidator = [
  param("id")
    .isMongoId().withMessage("Invalid outlet ID"),

  body("name")
    .optional()
    .isString().withMessage("Outlet name must be a string"),

  body("code")
    .optional()
    .isString().withMessage("Code must be a string"),

  body("phone")
    .optional()
    .isMobilePhone().withMessage("Invalid phone number"),

  body("openingHours.open")
    .optional()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Open time must be in HH:mm format"),

  body("openingHours.close")
    .optional()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Close time must be in HH:mm format"),

  body("openingHours.weeklyOff")
    .optional()
    .isArray({ min: 0, max: 7 })
    .withMessage("Weekly off must be an array of day numbers (0-6)"),

  body("deliveryCharges")
    .optional()
    .isIn(["FIXED", "PER_KM", "FREE_ABOVE"])
    .withMessage("Invalid delivery charge type"),

  body("deliveryConfig.fixed")
    .optional()
    .isNumeric().withMessage("Fixed delivery charge must be a number"),

  body("deliveryConfig.perKm")
    .optional()
    .isNumeric().withMessage("Per km delivery charge must be a number"),

  body("deliveryConfig.freeAbove")
    .optional()
    .isNumeric().withMessage("Free above amount must be a number"),

  body("gstIN")
    .optional()
    .isString().withMessage("GSTIN must be a string")
];

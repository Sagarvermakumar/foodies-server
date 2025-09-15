import { body } from "express-validator";

export const addressValidator = [
  body("addressLine").notEmpty().withMessage("addressLine is required"),
  body("label")
    .optional()
    .isIn(["Home", "Work", "Other"])
    .withMessage("Label must be one of Home, Work, or Other"),
  body("location.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be an array of [lng, lat]")
    .custom((coords) => {
      if (typeof coords[0] !== "number" || typeof coords[1] !== "number") {
        throw new Error("Coordinates must contain numbers");
      }
      if (coords[0] < -180 || coords[0] > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
      if (coords[1] < -90 || coords[1] > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
      return true;
    }),
];

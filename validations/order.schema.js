import { body } from "express-validator";

export const checkoutValidator = [
  body("cartId").notEmpty().withMessage("Cart ID is required"),
  body("items").isArray({ min: 1 }).withMessage("At least 1 item is required"),
];

export const statusUpdateValidator = [
  body("status")
    .isIn([
    "PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "PICKED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "COMPLETE",
    ])
    .withMessage("Invalid status"),
];

export const assignDeliveryValidator = [
  body("deliveryPersonId").notEmpty().withMessage("Delivery staff ID required"),
];

export const cancelOrderValidator = [
  body("reason").notEmpty().withMessage("Cancellation reason required"),
];

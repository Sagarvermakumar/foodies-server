import express from "express";
import { body, param } from "express-validator";
import {
  getAssignedOrders,
  markOrderDelivered,
  markOrderPicked,
  updateLocation,
} from "../controllers/delivery.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";

const router = express.Router();

/**
 * @desc    Get assigned delivery orders
 * @route   GET /api/v1/delivery/assigned
 * @access  DELIVERY
 */
router.get(
  "/assigned",
  isAuthenticate,
  authorize([ 'DELIVERY']),
  getAssignedOrders
);

/**
 * @desc    Mark order as picked
 * @route   PATCH /api/v1/delivery/:orderId/pick
 * @access  DELIVERY
 */
router.patch(
  "/:orderId/pick",
  isAuthenticate,
  authorize(["DELIVERY"]),
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  markOrderPicked
);

/**
 * @desc    Update delivery partner location
 * @route   PATCH /api/v1/delivery/:orderId/location
 * @access  DELIVERY
 */
router.patch(
  "/:orderId/location",
  isAuthenticate,
  authorize(["DELIVERY"]),
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  body("lat").isFloat().withMessage("Latitude must be a number"),
  body("lng").isFloat().withMessage("Longitude must be a number"),
  updateLocation
);

/**
 * @desc    Mark order as delivered
 * @route   PATCH /api/v1/delivery/:orderId/delivered
 * @access  DELIVERY
 */
router.patch(
  "/:orderId/delivered",
  isAuthenticate,
  authorize(["DELIVERY"]),
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  markOrderDelivered
);

export default router;

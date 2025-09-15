// routes/notificationRoutes.js
import express from "express";
import {
  pushNotification,
  sendOrderNotification,
} from "../controllers/notification.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import {
  validateOrderNotification,
  validatePushNotification,
} from "../validations/notification.schema.js";

const router = express.Router();

/**
 * @desc    Push general notification
 * @route   POST /api/v1/notifications/push
 * @access  MANAGER, SUPER_ADMIN
 */
router.post(
  "/push",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  validatePushNotification,
  validateRequest,
  pushNotification
);

/**
 * @desc    Send order notification
 * @route   POST /api/v1/notifications/order/:id
 * @access  MANAGER, STAFF
 */
router.post(
  "/order/:id",
  isAuthenticate,
  authorize(["MANAGER", "STAFF", "SUPER_ADMIN"]),
  validateOrderNotification,
  validateRequest,
  sendOrderNotification
);

export default router;

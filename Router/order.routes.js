import { Router } from "express";
import {
  assignOrderToDelivery,
  cancelOrder,
  checkOrderStatus,
  createOrder,
  deleteCancelledOrder,
  generateInvoice,
  getAllOrders,
  getMyOrders,
  getOrderById,
  processRefund,
  QuickRepeatOrder,
  startCheckout,
  updateOrderStatus
} from "../controllers/order.controller.js";

import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import {
  assignDeliveryValidator,
  cancelOrderValidator,
  statusUpdateValidator
} from "../validations/order.schema.js";
const router = Router();

/**
 * @desc    Create order from cart
 * @route   POST /api/v1/orders/checkout
 * @access  CUSTOMER
 */
router.get(
  "/start-checkout",
  isAuthenticate,
  authorize(["CUSTOMER","SUPER_ADMIN"]),
  startCheckout
);
router.post(
  "/checkout",
  isAuthenticate,
  // authorize(["CUSTOMER"]),
  // checkoutValidator,
  // validateRequest,
  createOrder
);

/**
 * @desc    Get my order history
 * @route   GET /api/v1/orders/my
 * @access  CUSTOMER
 */
router.get("/my", isAuthenticate, authorize(["CUSTOMER","SUPER_ADMIN"]), getMyOrders);

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:id
 * @access  CUSTOMER (own) / ADMIN (assigned outlet)
 */
router.get("/details/:id", isAuthenticate, getOrderById);

/**
 * @desc    Get all orders (filter by status/date)
 * @route   GET /api/v1/orders
 * @access  MANAGER / STAFF
 */
router.get(
  "/all",
  isAuthenticate,
  authorize(["SUPER_ADMIN","MANAGER", "STAFF"]),
  getAllOrders
);

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  MANAGER / STAFF
 */
router.patch(
  "/:id/status",
  isAuthenticate,
  authorize(["SUPER_ADMIN","MANAGER", "STAFF"]),
  statusUpdateValidator,
  validateRequest,
  updateOrderStatus
);

/**
 * @desc    Assign delivery staff
 * @route   PATCH /api/v1/orders/:id/assign
 * @access  MANAGER
 */
router.patch(
  "/:id/assign",
  isAuthenticate,
  authorize(["SUPER_ADMIN","MANAGER","STAFF"]),
  assignDeliveryValidator,
  validateRequest,
  assignOrderToDelivery
);

/**
 * @desc    Cancel order
 * @route   PATCH /api/v1/orders/:id/cancel
 * @access  CUSTOMER / ADMIN
 */
router.patch(
  "/:id/cancel",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "CUSTOMER"]),
  cancelOrderValidator,
  validateRequest,
  cancelOrder
);

/**
 * @desc    Generate invoice PDF
 * @route   POST /api/v1/orders/:id/invoice
 * @access  MANAGER / STAFF
 */
router.get(
  "/:id/invoice",
  isAuthenticate,
  authorize(["MANAGER", "STAFF"]),
  generateInvoice
);

/**
 * @desc    Trigger refund
 * @route   POST /api/v1/orders/:id/refund
 * @access  MANAGER / SUPER_ADMIN
 */
router.post(
  "/:id/refund",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  processRefund
);
/**
 * @desc    Check order status
 * @route   POST /api/v1/orders/:id/status
 * @access  Customer
 */
router.post(
  "/:id/status",
  isAuthenticate,
  authorize(["CUSTOMER"]),
  checkOrderStatus
);
/**
 * @desc    Delete cancel order
 * @route   POST /api/v1/orders/:id/refund
 * @access  MANAGER / SUPER_ADMIN
 */
router.delete(
  "/:id/delete",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  deleteCancelledOrder
);
/**
 * @desc    Trigger refund
 * @route   POST /api/v1/orders/:id/refund
 * @access  CUSTOMER
 */
router.post(
  "/:id/repeat",
  isAuthenticate,
  authorize(["CUSTOMER"]),
  QuickRepeatOrder
);

export default router;

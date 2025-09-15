// routes/reportRoutes.js
import express from "express";
import { query } from "express-validator";
import {
  exportReportCSV,
  getAllStats,
  getCustomerReport,
  getDeliveryPerformanceReport,
  getOrderStats,
  getSalesReport,
  getTopItemsReport
} from "../controllers/report.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";
const router = express.Router();

/**
 * @desc    Get sales report by range (day/week)
 * @route   GET /api/v1/reports/sales?range=day|week
 * @access  MANAGER, SUPER_ADMIN
 * @use     Provides sales data aggregated by day or week
 * @query   range - either 'day' or 'week'
 */
router.get(
  "/sales",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  [
    query("range")
      .isIn(["day", "week"])
      .withMessage("Range must be either 'day' or 'week'"),
  ],
  getSalesReport
);

/**
 * @desc    Get top selling items report
 * @route   GET /api/v1/reports/top-items
 * @access  MANAGER, SUPER_ADMIN
 * @use     Provides data on top performing menu items
 */
router.get(
  "/top-items",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  getTopItemsReport
);

/**
 * @desc    Get customers report (active, new, returning)
 * @route   GET /api/v1/reports/customers
 * @access  MANAGER, SUPER_ADMIN
 * @use     Provides insights into customer base and activity
 */
router.get(
  "/customers",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  getCustomerReport
);

/**
 * @desc    Get delivery performance report
 * @route   GET /api/v1/reports/delivery-performance
 * @access  MANAGER, SUPER_ADMIN
 * @use     Provides average delivery time and performance stats
 */
router.get(
  "/delivery-performance",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  getDeliveryPerformanceReport
);

/**
 * @desc    Export reports to CSV
 * @route   GET /api/v1/reports/export.csv
 * @access  MANAGER, SUPER_ADMIN
 * @use     Allows downloading report data as CSV file
 */
router.get(
  "/export.csv",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  exportReportCSV
);

/**
 * @desc    Get all Stats
 * @route   GET /api/v1/reports/stats
 * @access  MANAGER, SUPER_ADMIN
 */
router.get(
  "/stats",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  getAllStats
);

/**
 * @desc    Order Stats
 * @route   GET /api/v1/reports/order
 * @access  MANAGER, SUPER_ADMIN
 */
router.get(
  "/order",
  isAuthenticate,
  authorize(["MANAGER", "SUPER_ADMIN"]),
  getOrderStats
);

export default router;

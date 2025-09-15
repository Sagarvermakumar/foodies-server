import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import { createCouponValidator } from "../validations/coupon.schema.js";
import { authorize } from "../Middleware/authorize.js";
const router = express.Router();

router.use(isAuthenticate);
router.use(authorize(["MANAGER", "SUPER_ADMIN"]));
/**
 * Manager & Super Admin: Get all coupons
 */
router.get("/", getCoupons);

/**
 * Manager & Super Admin: Create, Update, Delete coupons
 */
router.post("/", createCouponValidator, validateRequest, createCoupon);

/**
 * Manager & Super Admin: Update a coupon
 */
router.route("/:id").patch(updateCoupon).delete(deleteCoupon).get(getCoupon);

export default router;

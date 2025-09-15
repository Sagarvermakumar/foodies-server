import { Router } from "express";
import {
  createReview,
  getReviewsByItem,
  replyToReview,
} from "../controllers/review.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import { authorize } from "../Middleware/authorize.js";
import {
  createReviewValidator,
  getReviewsByItemValidator,
  replyToReviewValidator,
} from "../validations/review.schema.js";

const router = Router();

/**
 * @desc    Create a new review for an item
 * @route   POST /api/v1/reviews
 * @access  Customer (must have ordered the item)
 * @use     This endpoint allows a customer to leave a review after ordering an item
 * @body    { itemId, rating, comment }
 */
router.post(
  "/create",
  isAuthenticate,
  authorize("CUSTOMER"),
  createReviewValidator,
  validateRequest,
  createReview
);

/**
 * @desc    Get reviews for a specific item
 * @route   GET /api/v1/reviews/item/:itemId
 * @access  Public
 * @use     This endpoint allows anyone to view reviews for a particular menu item
 * @param   itemId - ID of the menu item
 */
router.get(
  "/item/:itemId",
  getReviewsByItemValidator,
  validateRequest,
  getReviewsByItem
);

/**
 * @desc    Reply to a review (Manager or Super Admin only)
 * @route   PATCH /api/v1/reviews/:id/reply
 * @access  Manager / Super Admin
 * @use     This endpoint allows managers or admins to reply to customer reviews
 * @body    { reply }
 */
router.patch(
  "/:id/reply",
  isAuthenticate,
  authorize(["SUPER_ADMIN","MANAGER"]),
  replyToReviewValidator,
  validateRequest,
  replyToReview
);

export default router;

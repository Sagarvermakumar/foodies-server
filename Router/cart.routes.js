// routes/cart.routes.ts
import express from 'express'
import {
  addToCart,
  applyCoupon,
  getCart,
  getUserCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cart.controller.js'
import { isAuthenticate } from '../Middleware/Auth.js'
import { authorize } from '../Middleware/authorize.js'
import { validateRequest } from '../Middleware/validateMiddleware.js'
import {
  validateAddToCart,
  validateApplyCoupon,
  validateUpdateCartItem,
} from '../validations/cart.schema.js'

const router = express.Router()

router.use(isAuthenticate, authorize(['CUSTOMER', 'SUPER_ADMIN']))

/**
 * @route   /api/cart
 * @desc    Get current user's cart OR Add item to cart
 * @method  GET    → Returns the user's cart with items, totals, and applied coupon
 * @method  POST   → Add a new item to the cart (or increase qty if already present)
 * @access  Private (User must be logged in)
 */
router
  .route('/')
  .get(getCart)
  .post(validateAddToCart, validateRequest, addToCart)

/**
 * @route   /api/cart/item/:lineId
 * @desc    Update or remove a specific cart item
 * @method  PATCH  → Update quantity / variation / addons of a cart item
 * @method  DELETE → Remove a specific item from the cart
 * @access  Private (User must be logged in)
 */
router
  .route('/item/:lineId')
  .patch(validateUpdateCartItem, validateRequest, updateCartItem)
  .delete(removeCartItem)

/**
 * @desc    Apply coupon code to the current user's cart
 * @route   PATCH /api/v1/cart/apply-coupon
 * @access  Private (Customer must be logged in)
 */
router.patch('/apply-coupon', validateApplyCoupon, validateRequest, applyCoupon)

/**
 * @desc    Get cart details of a specific user (Admin or self access)
 * @route   GET /api/v1/cart/user/:userId
 * @access  Private (Customer can fetch their own cart, Admin can fetch any user's cart)
 */
router.get('/user/:userId', getUserCart)


export default router

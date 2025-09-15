// controllers/cart.controller.ts
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ErrorHandler from "../Middleware/Error.js";
import Cart from "../Models/Cart.model.js";
import Coupon from "../Models/Coupon.model.js";
import { calculateCartTotals } from "../Utils/calculateCartTotals.js";

/**
 * @desc    Get current user's cart
 * @route   GET /api/v1/cart
 * @access  CUSTOMER
 */

export const getCart = catchAsyncError(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate("items.item")
    .populate("coupon");

  if (!cart) return next(new ErrorHandler("Cart is empty", 404));

  // Ensure coupon is still valid
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    const now = new Date();
    if (!coupon?.active || (coupon?.endAt && now > coupon.endAt)) {
      cart.coupon = null; // remove invalid coupon
    }
  }

  // Always recalc totals before returning
  await calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart items fetched successfully",
    data: cart,
  });
});


// GET: Fetch cart for a user
export const getUserCart = catchAsyncError(async (req, res) => {
  const { userId } = req.params;

  // Find cart for user
  const cart = await Cart.findOne({ user: userId })
    .populate("items.item")
    .populate("outlet")
    .populate("coupon")
    .lean();

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  res.status(200).json({
    success: true,
    cart,
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/add
 * @access  CUSTOMER
 */

export const addToCart = catchAsyncError(async (req, res, next) => {
  const { itemId, quantity, unitPrice, variation, addons, outletId } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [],
      outlet: outletId,
      totals: {},
    });
  }

  let existingItem = cart.items.find(
    (i) =>
      i.item.toString() === itemId &&
      JSON.stringify(i.variation) === JSON.stringify(variation)
  );

  if (existingItem) {
    existingItem.qty += quantity;
  } else {
    cart.items.push({
      item: itemId,
      qty: quantity,
      variation,
      addons,
      priceSnapshot: unitPrice,
    });
  }

  await calculateCartTotals(cart);
  await cart.save();

  res.status(201).json({
    success: true,
    message: `Added to Cart`,
    data: cart,
  });
});


/**
 * @desc    Update cart item quantity/variation/addons
 * @route   PATCH /api/v1/cart/item/:lineId
 * @access  CUSTOMER
 */

export const updateCartItem = catchAsyncError(async (req, res, next) => {
  const {  quantity } = req.body;
  const itemId = req.params.lineId;
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate('items.item')
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  const item = cart.items.map(i => {
    if (i._id.toString() === itemId) {
      i.qty = quantity;
    }
    return i;
  
  });


  // const item = cart.items.find((i) => i._id.toString() === itemId);
  if (!item) return next(new ErrorHandler("Cart item not found", 404));

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.item._id.toString() !== itemId);
  } else {
    item.qty = quantity;
  }

  await calculateCartTotals(cart);

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart updated",
    data: cart,
  });
});



/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/item/:lineId
 * @access  CUSTOMER
 */

export const removeCartItem = catchAsyncError(async (req, res, next) => {
  const { lineId } = req.params;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new ErrorHandler("User Cart not found", 404));

  let item = cart.items.id(lineId);
  if (!item) item = cart.items.find((i) => i.item.toString() === lineId);
  if (!item) return next(new ErrorHandler("Cart item not found", 404));

  cart.items = cart.items.filter(
    (i) => i._id.toString() !== item._id.toString()
  );

  await calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: `${item.name || "Item"} removed from cart`,
    data: cart,
  });
});



/**
 * @desc    Apply coupon code to cart
 * @route   PATCH /api/v1/cart/apply-coupon
 * @access  CUSTOMER
 */

export const applyCoupon = catchAsyncError(async (req, res, next) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.item");
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    active: true,
  });
  if (!coupon) return next(new ErrorHandler("Invalid Coupon", 404));

  if (coupon.minOrder && cart.totals.subTotal < coupon.minOrder) {
    return next(
      new ErrorHandler(
        `Minimum order value for this coupon is ${coupon.minOrder}`
      ),
      400
    );
  }

  cart.coupon = coupon._id;
  await calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon Applied",
    data: cart,
  });
});



import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ErrorHandler from "../Middleware/Error.js";
import Coupon from "../Models/Coupon.model.js";

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/coupons
 * @access  Manager, Super Admin
 */
export const getCoupons = catchAsyncError(async (req, res, next) => {
  let { page = 1, limit = 10, query } = req.query;

  const filter = {};

  if (query) filter.query = query;
  if (query && query.trim() !== "") {
    const regex = new RegExp(query, "i");
    filter.$or = [{ code: regex }, { title: regex }];
  }

  page = Number(page) || 1;
  limit = Number(limit) || 10;
  // calculating skip
  const skip = (page - 1) * limit;

  // counting total doc
  const total = await Coupon.countDocuments();

  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!coupons || coupons.length === 0) {
    return next(new ErrorHandler("Coupons Not Found", 404));
  }

  res.status(200).json({
    success: true,
    message: "All Coupons Fetched Successfully!",
    data: coupons,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/coupons
 * @access  Manager, Super Admin
 */
export const createCoupon = catchAsyncError(async (req, res, next) => {
  const {
    code,
    title,
    type,
    value,
    minOrder,
    maxDiscount,
    startAt,
    endAt,
    active,
    usageLimit,
    perUserLimit,
    description
  } = req.body;

  const coupon = await Coupon.create({
    code,
    title,
    type,
    value,
    minOrder,
    maxDiscount,
    startAt,
    endAt,
    active,
    usageLimit,
    perUserLimit,
    description
  });

  res.status(201).json({
    success: true,
    message: "Coupon Created",
    data: coupon,
  });
});

/**
 * @desc    Update a coupon
 * @route   PATCH /api/v1/coupons/:id
 * @access  Manager, Super Admin
 */
export const updateCoupon = catchAsyncError(async (req, res, next) => {
  const couponID = req.params.id;
  const updated = await Coupon.findByIdAndUpdate(couponID, req.body, {
    new: true,
  });
  if (!updated) return next(new ErrorHandler("Coupon Not found!", 404));
  res.status(200).json({
    success: true,
    message: "Coupon Updated",
    data: updated,
  });
});

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/v1/coupons/:id
 * @access  Manager, Super Admin
 */
export const deleteCoupon = catchAsyncError(async (req, res, next) => {
  const couponID = req.params.id;
  const deleted = await Coupon.findByIdAndDelete(couponID);
  if (!deleted) return next(new ErrorHandler("Coupon Not found!", 404));
  res.status(200).json({
    success: true,
    message: "Coupon Deleted",
    data: deleted,
  });
});

/**
 * @desc    Get a single coupon
 * @route   GET /api/v1/coupons/:id
 * @access  Manager, Super Admin
 */
export const getCoupon = catchAsyncError(async (req, res, next) => {
  const couponID = req.params.id;

  if (!couponID) {
    return next(new ErrorHandler("Invalid Coupon ID", 400));
  }
  const coupon = await Coupon.findById(couponID);
  if (!coupon) return next(new ErrorHandler("Coupon Not found!", 404));
  res.status(200).json({
    success: true,
    message: "Coupon Fetched Successfully!",
    data: coupon,
  });
});

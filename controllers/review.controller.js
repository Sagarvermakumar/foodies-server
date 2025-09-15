import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ErrorHandler from "../Middleware/Error.js";
import Order from "../Models/Order.model.js";
import Review from "../Models/Review.model.js";

/**
 * @desc    Create a review for an item
 * @route   POST /api/v1/reviews
 * @access  Customer (must have ordered the item)
 * @use     This endpoint allows a customer to leave a review only if they have previously ordered the item
 */
export const createReview = catchAsyncError(async (req, res, next) => {
  const { itemId, rating, comment } = req.body;

  // Check if user has ordered this item
  const hasOrdered = await Order.findOne({
    user: req.user._id,
    "items.item": itemId, // assuming each order has items: [{ item, quantity }]
    status: { $in: ["DELIVERED", "COMPLETE"] }, // only allow after delivery
  });

  if (!hasOrdered) {
    return next(
      new ErrorHandler(
        "You can only review items that you have ordered and received",
        400
      )
    );
  }

  //Create review
  const review = await Review.create({
    user: req.user._id,
    item: itemId,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: review,
  });
});

/**
 * @desc    Get reviews for a specific item
 * @route   GET /api/v1/reviews/item/:itemId
 * @access  Public
 */
export const getReviewsByItem = catchAsyncError(async (req, res) => {
  let { page = 1, limit = 10, query = "", sortBy = "createdAt", order = "desc" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = { item: req.params.itemId };

  // Search filter (review text or user name/email)
  if (query && query.trim() !== "") {
    const regex = new RegExp(query, "i");
    filter.$or = [{ text: regex }];
  }

  const sortOrder = order === "asc" ? 1 : -1;

  // Query with pagination + populate
  const reviews = await Review.find(filter)
    .populate("user", "name email").populate("item")
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);
    // Margherita Pizzazzzzzz was delicious and fresh!

  // Total count for pagination
  const total = await Review.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",

    data: reviews,
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
 * @desc    Reply to a review
 * @route   PATCH /api/v1/reviews/:id/reply
 * @access  MANAGER/SUPER_ADMIN
 */
export const replyToReview = catchAsyncError(async (req, res) => {
    const {reply} = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  }

  review.reply = {
    text: reply,
    repliedBy: req.user._id,
  };

  await review.save();

  res.status(200).json({ success: true, data: review });
});

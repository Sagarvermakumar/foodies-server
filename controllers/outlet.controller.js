import Outlet from "../Models/Outlet.model.js";
import ErrorHandler from "../Middleware/Error.js";
import Address from "../Models/Address.model.js";
import catchAsyncError from "../Middleware/CatchAsyncError.js";

/**
 * @desc     Fetch all active outlets from the database.  This is typically used by customers to view available restaurant outlets.
 * @route   GET /outlets
 * @access  Public
 */
export const getOutlets = catchAsyncError(async (req, res, next) => {
  let { page = 1, limit = 10, query } = req.query;

  let filter = {};

  // search name
  if (query) {
    const regex = new RegExp(query, "i");
    filter.name = regex;
  }

  //  Fetch with pagination
  const outlets = await Outlet.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Outlet.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Outlets fetched successfully",
    data: outlets,
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
 * @desc    Create a new outlet record in the database.
 * @route   POST /outlets
 * @access  SUPER_ADMIN
 */
export const createOutlet = catchAsyncError(async (req, res, next) => {
  const {
    name,
    code,
    phone,
    openingHours,
    deliveryCharges,
    deliveryConfig,
    gstIN,

    address,
  } = req.body;

  const userId = req.user._id;

  // check outlet exist
  let existingOutlet = await Outlet.findOne({ $or: [{ name }, { code }] });

  if (existingOutlet)
    return next(
      new ErrorHandler(`${existingOutlet.name} Is Already Exist`, 400)
    );

  let userAddress = await Address.findOne({ user: userId });
  if (!userAddress) {
    if (!address || !address.label || !address.location) {
      return next(
        new ErrorHandler("Valid address is required to create outlet", 400)
      );
    }
    userAddress = await Address.create({
      ...address,
      user: userId,
    });
  }
  const outlet = await Outlet.create({
    name,
    code,
    phone,
    openingHours,
    deliveryCharges,
    deliveryConfig,
    gstIN,
    address: userAddress._id,
  });

  res.status(201).json({
    success: true,
    message: "Outlets Created successfully",
    data: outlet,
  });
});

/**
 * @desc    Update details of an existing outlet.
 * @route   PATCH /outlets/:id
 * @access  SUPER_ADMIN
 */
export const updateOutlet = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const outlet = await Outlet.findByIdAndUpdate(id, req.body, { new: true });

  if (!outlet) {
    return next(new ErrorHandler("Outlet not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Outlet updated successfully",
    outlet,
  });
});

/**
 * @desc   Retrieve specific outlet configuration details such as delivery charges,
 *         delivery configuration, operating hours, and GST number.
 *         Managers can access only their own outlet's config; Super Admins can access any.
 * @route   GET /outlets/:id/config
 * @access  MANAGER (own outlet) or SUPER_ADMIN
 */
export const getOutletConfig = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const outlet = await Outlet.findById(id, {
    deliveryCharges: 1,
    deliveryConfig: 1,
    openingHours: 1,
    gstIN: 1,
    _id: 0,
  });

  if (!outlet) {
    return next(new ErrorHandler("Outlet config not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Outlet configuration fetched",
    data: outlet,
  });
});

export const getOutletDetails = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return next(new ErrorHandler("Outlet is Required"));
  }

  const outlet = await Outlet.findById(id).populate('address')

  if (!outlet) {
    return next(new ErrorHandler("Invalid Outlet ID"));
  }

  res.status(200).json({
    success: true,
    message: "Outlet details Fetched Successfully",
    data: outlet,
  });
});

import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ErrorHandler from "../Middleware/Error.js";
import Address from "../Models/Address.model.js";
import User from "../Models/User.model.js";

// Get user by ID
export const getUserById = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  const address = await Address.find({ user: user._id });
  const data = {
    ...user.toObject(),
    address: address || [],
  };
  res
    .status(200)
    .json({ success: true, message: "User fetched successfully", data });
});

/**
 * @desc    Update profile information of the logged-in user
 * @route   PUT /api/v1/user/update-profile
 * @access  Private
 */
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email, phoneNumber } = req.body || {};

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (name) user.name = name || user.name;
  if (email) user.email = email || user.email;
  if (phoneNumber) user.phoneNumber = phoneNumber || user.phoneNumber;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const updateProfilePic = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  console.log("File : ", file)
  if (!file) {
    return next(new ErrorHandler("Please Upload Your Avatar", 400));
  }

  const user = await User.findById(req.user._id);

  // Only allow if: user is updating their own profile OR admin
  if (
    req.user._id.toString() !== user._id.toString() 
  ) {
    return next(
      new ErrorHandler(
        "You are not authorized to update this profile picture",
        403
      )
    );
  }

  user.avatar = {
    public_id: file.filename,
    url: file.path,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Your Profile Pic Updated Successfully",
    user,
  });
});

// Get all users with wallet & referral info
export const getAllUsers = catchAsyncError(async (req, res) => {
  let {
    query,
    role,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  // Convert pagination values to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  // Build filter object
  const filter = {};

  if (role) filter.role = role;

  if (query) {
    const regex = new RegExp(query, "i");
    filter.$or = [{ name: regex }, { email: regex }, { phoneNumber: regex }];
  }

  // Build sorting object
  const sortOptions = {};
  if (sortBy) sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  // Fetch users with pagination, sorting, and filtering
  const users = await User.find(filter)
    .select("-password")
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
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

// Block user
export const blockUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "blocked" },
    { new: true }
  );
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({
    success: true,
    message: `${user.name} blocked successfully`,
    user,
  });
});

// Unblock user
export const unblockUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true }
  );
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({
    success: true,
    message: `${user.name} unblocked successfully`,
    user,
  });
});

// user role
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { role } = req.body;
  if (
    !["SUPER_ADMIN", "MANAGER", "STAFF", "DELIVERY", "CUSTOMER"].includes(role)
  ) {
    return next(new ErrorHandler("Invalid Role Value", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    message: `${user.name} role updated to ${role}`,
    user,
  });
});

// get all customers
export const getAllCustomers = catchAsyncError(async (req, res, next) => {
  const customers = await User.find({ role: "User" }).select("-password");

  if (!customers || customers.length === 0) {
    return next(new ErrorHandler("No customers found", 404));
  }
  res.status(200).json({
    success: true,
    message: "All Customers Fetched Successfully",
    customers,
  });
});

// Delete user profile
export const deleteProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params._id);
  console.log("req.params._id : ", req.params._id)

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role === "SUPER_ADMIN") {
    return next(
      new ErrorHandler(
        "Admins are not allowed to delete their own profile.",
        403
      )
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `${user.name}'s Profile deleted successfully`,
    user,
  });
});


export const getAllDeliveryPerson = catchAsyncError(async(req,res,next)=>{

  const deliveryPerson = await User.find({role:"DELIVERY"}).select("_id name");
  
  if(!deliveryPerson || deliveryPerson.length === 0){
    return next(new ErrorHandler("No Delivery Person Found",404))
  }
  res.status(200).json({
    success: true,
    message: "All Delivery Persons Fetched Successfully",
    data:deliveryPerson
  });
});


export const getAllStaff = catchAsyncError(async(req,res,next)=>{

  
  const staff = await User.find({role:"STAFF"});
  const manager = await User.find({role:"MANAGER"});
  const delivery = await User.find({role:"DELIVERY"});
  const admin = await User.find({role:"SUPER_ADMIN"});


  const employees = [...staff, ...manager, ...delivery, ...admin];
  if(!employees || employees.length === 0){
    return next(new ErrorHandler("No Staff Found",404))
  }
  res.status(200).json({
    success: true,
    message: "All employees Fetched Successfully",
    data: employees
  });
});



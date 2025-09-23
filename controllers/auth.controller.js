import crypto from 'crypto'
import catchAsyncError from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/Error.js'
import Address from '../Models/Address.model.js'
import OTP from '../Models/OTP.model.js'
import ResetToken from '../Models/PasswordToken.model.js'
import User from '../Models/User.model.js'
import { sendToken } from '../Utils/SendToken.js'
import { sendOtp } from '../Utils/sendOtp.js'
import { sendResetLink } from '../Utils/sendResetLink.js'

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const createUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, phone, referredBy } = req.body || {}

  let userExists = await User.findOne({ email }).select('+password')

  if (userExists) return next(new ErrorHandler('User Already Exist', 400))

  // Generate unique referralCode for this user (e.g. first 6 hex chars)
  let referralCode = crypto.randomBytes(3).toString('hex').toUpperCase()

  // Make sure referral code is unique (very rare collision)
  while (await User.findOne({ referralCode })) {
    referralCode = crypto.randomBytes(3).toString('hex').toUpperCase()
  }

  const newUserData = {
    name,
    email,
    password,
    phone,
    referralCode,
    referredBy: referredBy || null,
    walletBalance: 0,
  }

  // If referredBy code is valid, give wallet reward to referrer
  if (referredBy) {
    const referrer = await User.findOne({ referralCode: referredBy })
    if (referrer) {
      referrer.walletBalance += 50 // reward to referrer
      await referrer.save()

      newUserData.walletBalance = 25 // reward to new user
    } else {
      return next(new ErrorHandler('Invalid Referral Code', 400))
    }
  }

  const user = await User.create(newUserData)

  sendToken(res, user, 'Registered Successfully', 201)
})

/**
 * @desc    Log in an existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { emailOrPhone, password } = req.body

  console.log(emailOrPhone, password)

  if (!emailOrPhone || !password) {
    return next(new ErrorHandler('Please provide email/phone and password', 400))
  }

  const user = await User.findOne({
    $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
  }).select('+password')
  if (!user) return next(new ErrorHandler('Invalid credentials', 404))

  const isMatchPassword = await user.matchPassword(password)

  if (!isMatchPassword) {
    return next(new ErrorHandler('Invalid credentials', 404))
  }

  sendToken(res, user, 'Login Successful', 200)
})

/**
 * @route POST /api/v1/auth/email/otp-login
 * @desc Send OTP to email for login
 * @access PUBLIC
 */

export const emailOtpLogin = catchAsyncError(async (req, res, next) => {
  const { emailOrPhone } = req.body

  if (!emailOrPhone) {
    return next(new ErrorHandler('Email or phone is required', 400))
  }

  // Try to find user by email first, then by phone
  const user =
    (await User.findOne({ email: emailOrPhone })) ||
    (await User.findOne({ phone: emailOrPhone }))

  if (!user) return next(new ErrorHandler('Invalid Email Or Phone', 404))

  // Send OTP to user's registered email
  await sendOtp(user.email, 'Your Login OTP Code', 5) // 5 minutes expiry

  res.json({ success: true, message: `OTP sent to ${user.email}` })
})

/**
 * @route POST /api/v1/auth/reset/password
 * @desc Reset password using reset token or OTP
 * @access PUBLIC
 */

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) return next(new ErrorHandler('Invalid Email', 404))

  await sendResetLink(email, 'Reset password Link', 10)

  res.json({
    success: true,
    message: 'Reset Password token send successfully in your email.',
  })
})

/**
 * @route POST /api/v1/auth/token-verification
 * @desc Verify password reset token from email link
 * @access PUBLIC
 */
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) {
    return next(new ErrorHandler('Token and new password are required', 400))
  }

  // find token in db
  const resetToken = await ResetToken.findOne({
    token,
    purpose: 'password-reset',
  })

  if (!resetToken) {
    return next(new ErrorHandler('Invalid or expired token', 400))
  }

  // check token expiry
  if (resetToken.expiresAt < new Date()) {
    return next(new ErrorHandler('Token has expired', 400))
  }

  // check is already used
  if (resetToken.used) {
    return next(new ErrorHandler('Token already used', 400))
  }

  // 4. User find karo
  const user = await User.findOne({ email: resetToken.identifier })
  if (!user) {
    return next(new (ErrorHandler('User not found', 400))())
  }

  // 5. Password hash and update
  user.password = newPassword
  await user.save()

  // 6. Token mark as used
  resetToken.used = true
  await resetToken.save()

  return res.json({ success: true, message: 'Password reset successful' })
})

/**
 * @route POST /api/v1/auth/otp-verification
 * @desc Verify the OTP for login or password reset
 * @access PUBLIC
 */
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body

  const otpDoc = await OTP.findOne({
    identifier: email,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  })

  if (!otpDoc) {
    return next(new ErrorHandler('Invalid or expired OTP', 400))
  }

  otpDoc.used = true
  await otpDoc.save()

  let user = await User.findOne({ email })
  if (!user) {
    user = await User.create({ email, name: 'New User', password: 'temp' })
  }

  sendToken(res, user, 'OTP verified successfully')
})
/**
 * @desc    Change password for the logged-in user
 * @route   PUT /api/v1/user/change-password
 * @access  Private
 */
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (currentPassword === newPassword) {
    return next(
      new ErrorHandler(
        'New password cannot be the same as current password',
        400
      )
    )
  }

  const user = await User.findById(req.user._id).select('+password') // Ensure password field is selected

  if (!user) {
    return next(new ErrorHandler('User not found', 404))
  }

  // Compare current password with stored password
  const isMatch = await user.matchPassword(currentPassword) // Ensure comparePassword is defined in your model

  if (!isMatch) {
    return next(new ErrorHandler('Incorrect current password', 401))
  }

  // Update password
  user.password = newPassword
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  })
})

/**
 * @desc    Log out the currently logged-in user
 * @route   GET /api/v1/user/logout
 * @access  Private
 */

export const logoutUser = catchAsyncError((req, res) => {
  const role = req.user?.role;

  const isProduction = process.env.NODE_ENV === 'production';

  const roleCookieMap = {
    SUPER_ADMIN: 'super_admin_token',
    MANAGER: 'manager_token',
    STAFF: 'staff_token',
    DELIVERY: 'delivery_token',
    CUSTOMER: 'customer_token',
  };

  const cookieName = roleCookieMap[role] || 'user_token';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'None',
    expires: new Date(0), // expire immediately
  };

  // Clear role-specific token
  res.cookie(cookieName, '', cookieOptions);

  // Clear last_active_role cookie as well
  res.cookie('last_active_role', '', {
    ...cookieOptions,
    httpOnly: false, // same as set before
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});



/**
 * @desc    Get profile details of the logged-in user
 * @route   GET /api/v1/user/me
 * @access  Private
 */
export const getMyProfile = async (req, res) => {
  const user = req.user
  const address = await Address.find({ user })
  const data = {
    ...user.toObject(),
    address: address || [],
  }
  res.status(200).json({
    success: true,
    message: 'Profile fetched',
    user: data,
  })
}

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { userID } = req.params
  const { role } = req.body

  if (!role) {
    return next(new ErrorHandler('Role is Required to updated role', 404))
  }
  if (
    !['SUPER_ADMIN', 'MANAGER', 'STAFF', 'DELIVERY', 'CUSTOMER'].includes(role)
  ) {
    return next(new ErrorHandler(`'${role}' provided role is not a valid role`))
  }
  const user = await User.findById(userID)

  if (!user) return next(new ErrorHandler('Invalid User ID', 404))

  user.role = role
})

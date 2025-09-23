import { Router } from "express";
import {
    changePassword,
    createUser,
    emailOtpLogin,
    forgotPassword,
    getMyProfile,
    loginUser,
    logoutUser,
    resetPassword,
    verifyOTP
} from "../controllers/auth.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import { changePasswordValidator, emailOrPhoneValidator, emailValidator, loginValidator, registerValidator } from "../validations/auth.schema.js";

const router = Router();

/**
 * @route   POST /api/v1/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidator, validateRequest, createUser);

/**
 * @route   POST /api/v1/user/login
 * @desc    Log in an existing user
 * @access  Public
 */
router.post("/login", loginValidator, validateRequest, loginUser);



/**
 * @route POST /api/v1/auth/email/otp-login
 * @desc Send OTP to email for login
 * @access PUBLIC
 */
router.post("/otp-login", emailOrPhoneValidator, validateRequest, emailOtpLogin);


/**
 * @route   PUT /api/v1/user/change-password
 * @desc    Change password for logged-in user
 * @access  Private
 */
router.patch("/change-password", isAuthenticate, changePasswordValidator, validateRequest, changePassword);


/**
 * @route POST /api/v1/auth/reset/password
 * @desc Reset password using reset token or OTP
 * @access PUBLIC
 */
router.post("/forget-password",  emailValidator, validateRequest, forgotPassword);

/**
 * @route POST /api/v1/auth/otp-verification
 * @desc Verify the OTP for login or password reset
 * @access PUBLIC
 */
router.post("/otp-verification",   validateRequest, verifyOTP);

/**
 * @route POST /api/v1/auth/token-verification
 * @desc Verify password reset token from email link
 * @access PUBLIC
 */
router.post("/reset-password",   validateRequest, resetPassword );



/**
 * @route   GET /api/v1/user/logout
 * @desc    Log out the current user
 * @access  Private
 */
router.post("/logout", isAuthenticate, logoutUser);


/**
 * @desc    Get profile details of the logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
router.get("/me", isAuthenticate, getMyProfile);



export default router;

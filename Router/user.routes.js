import { Router } from "express";
import {
  blockUser,
  deleteProfile,
  getAllDeliveryPerson,
  getAllUsers,
  getUserById,
  unblockUser,
  updateProfile,
  updateProfilePic,
  updateUserRole,
} from "../controllers/user.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";
import {  createUploader } from "../Middleware/upload.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import { updateProfileValidator } from "../validations/auth.schema.js";
const avatarUpload = createUploader("profilePics");
const router = Router();

router.use(isAuthenticate);

/**
 * @route   PATCH /api/v1/admin/user/:id/block
 * @desc    Block a user
 * @access  Private (only accessible by admin)
 * @params  id - user ID
 */
router.patch(
  "/:id/block",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  blockUser
);

/** * @route   PATCH /api/v1/admin/user/:id/unblock
 * @desc    Unblock a user
 * @access  Private (only accessible by admin)
 * @params  id - user ID
 */
router.patch(
  "/:id/unblock",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  unblockUser
);

/** * @route   PATCH /api/v1/admin/user/:id/role
 * @desc    Update user role (e.g., from User to Vendor)
 * @access  Private (only accessible by admin)
 * @params  id - user ID
 */
router.patch(
  "/:id/role",
  isAuthenticate,
  // authorize(["SUPER_ADMIN"]),
  updateUserRole
);

/**
 * @route   GET /api/v1/admin/user/:id
 * @desc    Get user by ID
 * @access  Private (only accessible by admin)
 * @params  id - user ID
 */
router.get("/details/:id", isAuthenticate, getUserById);

/**
 * route   PUT /api/v1/user/update-profile
 * @desc    Update profile details for logged-in user
 * @access  Private
 */
router.patch(
  "/update-profile",
  isAuthenticate,
  authorize(["CUSTOMER","STAFF","SUPER_ADMIN","MANAGER"]),
  updateProfileValidator,
  validateRequest,
  updateProfile
);
/**
 * @desc    Update User profile Picture
 * @route   PUT /api/v1/profile/update/avatar
 */

router.patch(
  "/profile/update/avatar",
  isAuthenticate,
  authorize(["CUSTOMER"]),
  avatarUpload.single("avatar"),
  updateProfilePic
);

/**
 * @route   GET /api/v1/admin/user/all
 * @desc    Get all users
 * @access  Private (only accessible by admin)
 */
router.get(
  "/all",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  getAllUsers
);
  
router.get(
  "/all/delivery-person",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER","STAFF"]),
  getAllDeliveryPerson
);

/**
 * @route   DELETE /api/v1/admin/user/delete-profile
 * @desc    Delete the account/profile of the logged-in user
 * @access  Private
 */
router.delete(
  "/:_id/delete-profile",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  deleteProfile
);

export default router;

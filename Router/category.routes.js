// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getMenusCategoryById,
  updateCategory
} from "../controllers/category.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";
import { createUploader } from "../Middleware/upload.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validations/category.schema.js";
const categoryUpload = createUploader("categories");

const router = express.Router();


/**
 * @desc    Get all categories
 * @route   GET /categories
 * @access  PUBLIC
 */
router.get("/", getCategories);

router
  .route("/:id")
  .get(getMenusCategoryById);

/**
 * @desc    Create a category
 * @route   POST /categories
 * @access  MANAGER (own outlet), SUPER_ADMIN
 */
router.use(isAuthenticate);


router.use(authorize(["MANAGER", "SUPER_ADMIN"]));

router.route("/").post(categoryUpload.single("image"),createCategoryValidator, createCategory);

router
  .route("/:id")
  .patch(updateCategoryValidator, updateCategory)
  .delete(deleteCategory);


  export default router;
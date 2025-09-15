import { Router } from "express";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
  getItemBySlug,
  getItemsByMostRated,
  getItemsByPriceRange,
  getPopularItems,
  toggleItemAvailability,
  updateItem,
  updateStockThreshold,
} from "../controllers/item.controller.js";
import { isAuthenticate } from "../Middleware/Auth.js";
import { authorize } from "../Middleware/authorize.js";
const itemUpload = createUploader("menuItems");

import { createUploader } from "../Middleware/upload.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import {
  createItemValidator,
  stockUpdateValidator,
  toggleItemValidator,
} from "../validations/item.schema.js";

const router = Router();


/**
 * @desc    Get all  items
 * @route   GET /api/v1/-item
 * @access  Public (anyone can view  items)
 */
router.get("/all", getAllItems);



/**
 * @desc    Create a new  item
 * @route   POST /api/v1/item/create
 * @access  Private (only authenticated User can create  items)
 */
router.post(
  "/create",
  isAuthenticate,
  authorize(['SUPER_ADMIN']),
  itemUpload.single("image"),
  createItemValidator,
  validateRequest,
  createItem
);


/**
 * @desc    Get  items by id
 * @route   GET /api/v1/item/details/:id
 * @access  Public (anyone can view  items)
 */

router.get("/details/:id", getItemById);
/**
 * @desc    Get a single  item by id
 * @route   GET /api/v1/-item/:id
 * @access  Public (anyone can view  items)
 * @params  id -  item ID
 */
router.get("/:slug", getItemBySlug);

/**
 * @desc    Update a  item
 * @route   PUT /api/v1/item/update/:id
 * @access  Private (only authenticated vendors can update their  items)
 * @params  id -  item ID
 */
router.put(
  "/update/:id",
  isAuthenticate,
  authorize(["SUPER_ADMIN"]),
  itemUpload.single("image"),
  updateItem
);



/**
 * @desc    Toggle availability of a  item
 * @route   PATCH /api/v1/-item/toggle/:itemId
 * @access  Private (only authenticated vendors can toggle availability)
 * @params  id -  item ID
 */

router.patch(
  "/toggle/:id",
  isAuthenticate,
  toggleItemValidator,
  validateRequest,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  toggleItemAvailability
);

/**
 * @desc    Delete a  item
 * @route   DELETE /api/v1/item/delete/:id
 * @access  Private (only authenticated vendors can delete their  items)
 * @params  id -  item ID
 */
router.delete(
  "/delete/:id",
  isAuthenticate,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  deleteItem
);


/**
 * @desc   update Stock Threshold
 * @route   DELETE /api/v1/item/stock/:id
 * @access  Private (only authenticated vendors can delete their  items)
 * @params  id -  item ID
 */
router.patch(
  "/stock/:id",
  isAuthenticate,
  stockUpdateValidator,
  validateRequest,
  authorize(["SUPER_ADMIN", "MANAGER"]),
  updateStockThreshold
);


/** * @desc    Get popular  items
 * @route   GET /api/v1/-item/popular
 * @access  Public (anyone can view popular  items)
 */

router.get("/popular", getPopularItems);

/**
 * @desc  Get  Item by Price Range
 * @route GET /api/v1/-item/price-range
 * @access Public (anyone can view  items by price range)
 */

router.get("/price-range", getItemsByPriceRange);

/**
 * @desc get item by most rated
 * @route GET /api/v1/-item/most-rated
 * @access Public (anyone can view  items by most rated)
 */

router.get("/most-rated/:rating", getItemsByMostRated);

//  Management
export default router;

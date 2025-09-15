import { Router } from "express";
import { isAuthenticate } from "../Middleware/Auth.js";
import { validateRequest } from "../Middleware/validateMiddleware.js";
import {
  createAddress,
  deleteAddress,
  getAllAddresses,
  getDefaultAddress,
  getLocationByPincode,
  setDefaultAddress,
  updateAddress,
} from "../controllers/address.controller.js";
import { addressValidator } from "../validations/address.schema.js";
const addressRouter = Router();

/**
 * @desc    Create a new address
 * @route   POST /api/v1/address/create
 * @access  Private (only authenticated users can create addresses)
 * @use     This endpoint allows users to add a new address
 * @body    label, fullName, phoneNumber, addressLine1, addressLine2, city, state, pinCode
 */
addressRouter.post("/create", isAuthenticate, addressValidator, validateRequest, createAddress);

/**
 * @desc    Delete an address
 * @route   DELETE /api/v1/address/delete/:id
 * @access  Private (only authenticated users can delete their own addresses)
 * @use     This endpoint allows users to delete an existing address
 * @params  id - address ID
 */
addressRouter.delete("/delete/:id", isAuthenticate, deleteAddress);



/**
  * @desc    Update an existing address
  * @route   PUT /api/v1/address/:id
  * @access  Private (only authenticated users can update their own addresses)
  * @use     This endpoint allows users to update an existing address
  * @params  id - address ID
  * @body    label, fullName, phoneNumber, addressLine1, addressLine2, city, state, pinCode

  * @returns {Object} - Updated address details   
 */

addressRouter.put("/update/:id", isAuthenticate, updateAddress);

/**
  * @desc    Get all addresses of the logged-in user
  * @route   GET /api/v1/address/all
  * @access  Private (only authenticated users can view their own addresses)
  * @use     This endpoint retrieves all addresses associated with the authenticated user
  * @returns {Array} - List of addresses
  
 */
addressRouter.get("/all", isAuthenticate, getAllAddresses);


/**
 * @desc set as default address
 * @route   PUT /api/v1/address/default/:id
 * @access  Private (only authenticated users can set a default address)
 * @use     This endpoint allows users to set an address as default
 */
addressRouter.put("/:id/default", isAuthenticate, setDefaultAddress);


/**
 * @desc get default address 
 * @route   GET /api/v1/address/default
 * @access  Private (only authenticated users can get their default address)
 * @use     This endpoint allows users to retrieve their default address
 */
addressRouter.get("/default", isAuthenticate, getDefaultAddress);


/**
 * @desc get address from pin code
 * @route Get /api/v1/address/pincode/:pinCode
 * @access Private (only authenticated users can get address by pin code)
 * @use This endpoint allows users to retrieve an address by its pin code
 */
addressRouter.get("/location/:pin", isAuthenticate,getLocationByPincode);

export default addressRouter;

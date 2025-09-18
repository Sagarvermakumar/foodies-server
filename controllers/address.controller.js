import catchAsyncError from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/Error.js'
import Address from '../Models/Address.model.js'
import { getAddressFromPincode } from '../Utils/pincodeHelper.js'

// get location frm pin
export const getLocationByPincode = catchAsyncError(async (req, res, next) => {
  const { pin } = req.params
  const details = await getAddressFromPincode(pin)

  if (!details) {
    return res.status(404).json({
      success: false,
      message: 'Invalid Pincode',
    })
  }

  res.status(200).json({
    success: true,
    data: details,
  })
})

/**
 * @desc create new address
 * @route   POST /api/v1/address
 * @access  Private
 *
 */

// Add new address controller
export const createAddress = async (req, res) => {
  let {
    label,
    addressLine,
    street,
    landmark,
    pinCode,
    contactName,
    contactPhone,
    instructions,
    location,
    city = '',
    state = '',
  } = req.body


  // 1. Check pincode API

  if (pinCode) {
    const details = await getAddressFromPincode(pinCode)
    if (details) {
      city = details.city
      state = details.state
    }
  }

  // 2. Create new address document
  const address = new Address({
    user: req.user._id, // logged-in user
    label,
    addressLine,
    street,
    landmark,
    pinCode,
    city,
    state,
    country: 'India',
    location,
    contactName,
    contactPhone,
    instructions,
  })

  await address.save()

  return res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: address,
  })
}

/**
 * @desc Get all addresses of the logged-in user or specific user
 * @route   GET /api/v1/address
 * @access  Private
 */

export const getAllAddresses = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query // default page=1, limit=10
  const skip = (page - 1) * limit

  // total count
  const count = await Address.countDocuments({ user: req.user._id })

  // paginated addresses
  const addresses = await Address.find({ user: req.user._id })
    .skip(skip)
    .limit(Number(limit))

  if (!addresses || addresses.length === 0) {
    return next(new ErrorHandler('No addresses found', 404))
  }

  res.status(200).json({
    success: true,
    message: 'All Addresses',
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
    addresses,
  })
})

/**
 * @desc Update an existing address
 * @route   PUT /api/v1/address/:id
 * @access  Private
 */
export const updateAddress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params

  if (!id) {
    return next(new ErrorHandler('Valid id is required'))
  }
  // Allowed fields according to your Address model
  const allowedFields = [
    'label',
    'addressLine',
    'street',
    'landmark',
    'city',
    'state',
    'pincode',
    'state',
    'location', // { type: "Point", coordinates: [lng, lat] }
    "instructions",
    "contactPhone"
  ]


  // Build update object only with fields present in req.body
  const updateFields = {}
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateFields[field] = req.body[field]
    }
  })

  // Update address
  const address = await Address.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  })

  if (!address) {
    return next(new ErrorHandler('Address not found', 404))
  }

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    address,
  })
})

/**
 * @desc Delete an address
 * @route   DELETE /api/v1/address/:id
 * @access  Private
 */
export const deleteAddress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params

  const allAddress = await Address.find({ user: req.user._id })
  if (allAddress.length < 1) {
    return next(new ErrorHandler('You must have at least one address', 400))
  }

  const address = await Address.findByIdAndDelete(id)

  if (!address) {
    return next(new ErrorHandler('Address not found', 404))
  }
  if (address.user.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("'You are not allowed to delete this address'", 403)
    )
  }
  // set another address as default if the deleted address was default
  if (address.isDefaultAddress) {
    const newDefaultAddress = allAddress[0]
    newDefaultAddress.isDefaultAddress = true
    await newDefaultAddress.save()
  }

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    addressId: address._id,
  })
})

/**
 * @desc Set an address as default
 * @route   PUT /api/v1/address/:id/default
 * @access  Private
 */

export const setDefaultAddress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params

  // Reset all addresses to not default
  await Address.updateMany({ user: req.user._id }, { isDefaultAddress: false })

  // Set the specified address as default
  const address = await Address.findByIdAndUpdate(
    id,
    { isDefaultAddress: true },
    { new: true }
  )

  if (!address) {
    return next(new ErrorHandler('Address not found', 404))
  }

  res.status(200).json({
    success: true,
    message: ` Your ${address.label} Address - ${address.addressLine}  set as default successfully`,
    address,
  })
})
/**
 * @desc Get the default address of the logged-in user
 * @route   GET /api/v1/address/default
 * @access  Private
 */

export const getDefaultAddress = catchAsyncError(async (req, res, next) => {
  const address = await Address.findOne({
    user: req.user._id,
    isDefaultAddress: true,
  })

  if (!address) {
    return next(new ErrorHandler('No default address found', 404))
  }

  res.status(200).json({
    success: true,
    message: ` Your ${address.label} Address - ${address.addressLine}  is your default Address`,
    address,
  })
})

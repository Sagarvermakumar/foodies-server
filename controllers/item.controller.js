import slugify from 'slugify'
import catchAsyncError from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/Error.js'
import Address from '../Models/Address.model.js'
import Item from '../Models/Item.model.js'
import Outlet from '../Models/Outlet.model.js'

/**
 *  @desc    Create new item
 *  @route   POST /items
 *  @access  MANAGER, SUPER_ADMIN
 */
export const createItem = catchAsyncError(async (req, res, next) => {
  const {
    name,
    category,
    description,
    isVeg,
    price,
    discount,
    lowStockThreshold,
    isAvailable,
    outlet,
  } = req.body;

  const numericPrice = Number(price);

  // Parse arrays (because FormData sends them as strings)
  const variations = req.body.variations ? JSON.parse(req.body.variations) : [];
  const addons = req.body.addons ? JSON.parse(req.body.addons) : [];

  // check outlet exist or not
  const outletExists = await Outlet.findById(outlet);
  if (!outletExists) {
    return res
      .status(400)
      .json({ message: 'Invalid outlet ID Or Outlet does not exist.' });
  }

  if (!req.file) {
    return next(new ErrorHandler('Image file is required', 400));
  }

  const imageURL = req.file.path;
  const userId = req.user._id;

  const isExistAddress = await Address.findOne({ user: userId });
  if (!isExistAddress)
    return next(new ErrorHandler('Add Your Outlet Address First', 404));

  const slug = slugify(name);

  // Create new menu item
  const newItem = await Item.create({
    name,
    slug,
    category,
    description,
    isVeg,
    price: numericPrice,
    variations,   // ✅ parsed
    addons,       // ✅ parsed
    discount,
    lowStockThreshold,
    isAvailable,
    outlet,
    image: imageURL,
    createdBy: userId,
  });

  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: newItem,
  });
});


/**
 * @desc    get all menu items that are available
 * @route   GET /api/v1/menu
 * @access  Public (anyone can view menu items)
 * @use     This endpoint allows users to view all available menu items
 */

export const getAllItems = catchAsyncError(async (req, res, next) => {
  let { query, page, limit } = req.query

  console.log(query)
  page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1
  limit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10

  const filters = {}

  if (query && query.trim() !== '') {
    const regex = new RegExp(query, 'i')

    filters.name = regex
  }

  // Pagination calculation
  const skip = (page - 1) * limit
  // console.log(filters);
  // Query with filters, skip, and limit
  const items = await Item.find(filters)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name')
    .populate('outlet', 'name')
    .populate('createdBy', 'name role')

  const total = await Item.countDocuments(filters)

  if (!items || items.length === 0) {
    return next(
      new ErrorHandler('No menu items found matching the criteria', 404)
    )
  }

  res.status(200).json({
    success: true,
    message: 'Filtered menu items fetched successfully',
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  })
})

// @desc    Get single item by slug
// @route   GET /items/:slug
// @access  PUBLIC
export const getItemBySlug = catchAsyncError(async (req, res, next) => {
  const slug = req.params.slug
  if (!slug) {
    return next(new ErrorHandler('Slug is required'))
  }
  const item = await Item.findOne({ slug }).populate('category outlet', 'name')
  if (!item) return res.status(404).json({ message: 'Item not found' })
  res.status(200).json({
    success: true,
    message: 'Fetched Item!',
    data: item,
  })
})

/**
 * @desc    Get menu items by Category
 * @route   GET /api/v1/menu/category/:category
 * @access  Public (anyone can view menu items by category)
 * @use     This endpoint allows users to view all menu items from a specific category
 * @params  category - category name
 */

export const getItemsByCategory = catchAsyncError(async (req, res, next) => {
  const { category } = req.params

  if (!category) return next(new ErrorHandler('Category is required', 400))

  // Fetch menu items by category
  const items = await Item.find({
    category: { $regex: category, $options: 'i' },
    isAvailable: true,
  })

  if (items.length === 0)
    return next(new ErrorHandler('No menu items found in this category', 404))

  res.status(200).json({
    success: true,
    message: 'Menu items by category fetched successfully',
    data: items,
  })
})

/**
 * @desc    Get a single menu item by ID
 * @route   GET /api/v1/menu/:id
 * @access  Public (anyone can view menu items)
 * @use     This endpoint allows users to view details of a specific menu item
 * @params  id - menu item ID
 */
export const getItemById = catchAsyncError(async (req, res, next) => {
  const itemId = req.params.id

  if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler('Invalid item ID', 400))
  }
  const item = await Item.findById(itemId)

  if (!item) return next(new ErrorHandler('Menu item not found', 404))
  res.status(200).json({
    success: true,
    message: 'Menu item fetched successfully',
    data: item,
  })
})

// @desc    Update item
// @route   PATCH /items/:id
// @access  MANAGER, SUPER_ADMIN
import { v2 as cloudinary } from 'cloudinary'

// ================= Update Item ===================
export const updateItem = catchAsyncError(async (req, res, next) => {
  const itemId = req.params.id

  if (!itemId) {
    return next(new ErrorHandler('Invalid item ID', 400))
  }
  console.log("body",req.body)
  console.log("file",req.file)
  let item = await Item.findById(itemId)
  if (!item) return next(new ErrorHandler('Item not found', 404))


      if (req.body.variations && typeof req.body.variations === "string") {
    try {
      req.body.variations = JSON.parse(req.body.variations);
    } catch (e) {
      req.body.variations = [];
    }
  }

  if (req.body.addons && typeof req.body.addons === "string") {
    try {
      req.body.addons = JSON.parse(req.body.addons);
    } catch (e) {
      req.body.addons = [];
    }
  }



  
  // If new image file is provided
  if (req.file) {
    if (item.image) {
      const publicId = getPublicIdFromUrl(item.image)
      await cloudinary.uploader.destroy(publicId)
    }
    // 2. Upload new image
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'menuItems',
    })
    console.log(uploadResult)
    // 3. Set new image data in req.body
    req.body.image = uploadResult.secure_url
  }

  // Update item with req.body (including image if uploaded)
  const updated = await Item.findByIdAndUpdate(itemId, req.body, { new: true })
  if (!updated) return next(new ErrorHandler('Failed to update item', 500))

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: updated,
  })
})

// @desc    Delete item
// @route   DELETE /items/:id
// @access  MANAGER, SUPER_ADMIN
export const deleteItem = async (req, res, next) => {
  const item = await Item.findByIdAndDelete(req.params.id)
  if (!item) return next(new ErrorHandler('Menu item not found', 404))

  res
    .status(200)
    .json({ success: true, message: 'Item deleted', _id: req.params.id })
}
// Toggle availability of a menu item
export const toggleItemAvailability = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params

    const item = await Item.findById(id)

    if (!item) return next(new ErrorHandler('Menu item not found', 404))

    // Toggle availability
    item.isAvailable = !item.isAvailable
    const updatedItem = await item.save()

    res.status(200).json({
      success: true,
      message: `${item.name} is now ${
        updatedItem.isAvailable ? 'available' : 'unavailable'
      }`,
      data: updatedItem,
    })
  }
)

// @desc    Update stock threshold
// @route   PATCH /items/:id/stock
// @access  MANAGER, STAFF
export const updateStockThreshold = catchAsyncError(async (req, res) => {
  const itemId = req.params.id
  const { lowStockThreshold } = req.body
  const item = await Item.findByIdAndUpdate(
    itemId,
    { lowStockThreshold },
    { new: true }
  )
  if (!item) return res.status(404).json({ message: 'Item not found' })
  res.json({
    success: true,
    message: 'Stock updated',
    data: item,
  })
})

/**
 * @desc    Get popular menu items
 * @route   GET /api/v1/menu/popular
 * @access  Public (anyone can view popular menu items)
 * @use     This endpoint allows users to view popular menu items based on ratings or reviews
 */
export const getPopularItems = catchAsyncError(async (req, res, next) => {
  const items = await Item.find({ isAvailable: true })
    .sort({ ratings: -1 })
    .limit(10)

  if (items.length === 0)
    return next(new ErrorHandler('No popular menu items found', 404))

  res.status(200).json({
    success: true,
    message: 'Popular menu items fetched successfully',
    data: items,
  })
})

/**
 * @desc    Get menu items by price range
 * @route   GET /api/v1/menu/price-range
 * @access  Public (anyone can view menu items by price range)
 * @use     This endpoint allows users to view all menu items within a specific price range
 * @query   min - minimum price, max - maximum price
 */

export const getItemsByPriceRange = catchAsyncError(async (req, res, next) => {
  const { min, max } = req.query

  if (!min || !max)
    return next(new ErrorHandler('Price range is required', 400))

  // Validate price range
  if (isNaN(min) || isNaN(max) || Number(min) < 0 || Number(max) < 0)
    return next(new ErrorHandler('Invalid price range', 400))

  // Fetch menu items by price range
  const Items = await Item.find({
    price: { $gte: Number(min), $lte: Number(max) },
    isAvailable: true,
  })

  if (Items.length === 0)
    return next(
      new ErrorHandler('No menu items found in this price range', 404)
    )

  res.status(200).json({
    success: true,
    message: 'Menu items by price range fetched successfully',
    Items,
  })
})

/**
 * @desc    Get menu items by rating
 * @route   GET /api/v1/menu/rating/:rating
 * @access  Public (anyone can view menu items by rating)
 * @use     This endpoint allows users to view all menu items with a specific rating or higher
 * @params  rating - minimum rating (0 to 5)
 */
export const getItemsByMostRated = catchAsyncError(async (req, res, next) => {
  const { rating = 1 } = req.params

  // Fetch menu items by rating
  const Items = await Item.find({
    ratings: { $gte: Number(rating) },
    isAvailable: true,
  })

  if (Items.length === 0)
    return next(new ErrorHandler('No menu items found with this rating', 404))

  res.status(200).json({
    success: true,
    message: 'Menu items by rating fetched successfully',
    Items,
  })
})

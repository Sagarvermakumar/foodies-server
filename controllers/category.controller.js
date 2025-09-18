// controllers/categoryController.js
import catchAsyncError from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/Error.js'
import Category from '../Models/Category.model.js'
import Item from '../Models/Item.model.js'

/**
 * @desc Get all categories (Public)
 * @route GET /categories
 * @access PUBLIC
 */
export const getCategories = catchAsyncError(async (req, res, next) => {
  let { page = 1, limit = 10, query } = req.query

  page = Number(page) || 1
  limit = Number(limit) || 10
  const filter = {}

  if (query) filter.name = new RegExp(query, 'i')

  // calculating skip
  const skip = (page - 1) * limit

  const categories = await Category.find(filter)
    .sort({ order: 1 })
    .skip(skip)
    .limit(limit)

  if (categories.length===0) return next(new ErrorHandler('categories not exit', 404))

  // counting total doc
  const total = await Category.countDocuments()
  res.json({
    success: true,
    message: 'all categories fetched Successfully,',
    data: categories,
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

/**
 * @desc Create a category
 * @route POST /categories
 * @access MANAGER (own outlet), SUPER_ADMIN
 */
export const createCategory = catchAsyncError(async (req, res, next) => {
  const {
    name,
    slug,
    description,
    availableItems,
    sortOrder,
    ratingCount,
    active,
  } = req.body
  const file = req.file
  if (!file) {
    return next(new ErrorHandler('Please Upload Category Image', 400))
  }

  // check category exist or not
  const isExistCategory = await Category.findOne({ name })

  if (isExistCategory)
    return next(new ErrorHandler('Category Already Exist', 400))

  // create new
  const category = await Category.create({
    image: {
      url: file.path,
      public_id: file.filename,
    },
    name,
    slug,
    description,
    active,
    sortOrder: Number(sortOrder) || 0,
    ratingCount: Number(ratingCount) || 0,
    availableItems: Number(availableItems) || 0,
    createdBy: req.user._id,
  })

  res
    .status(201)
    .json({ success: true, message: 'Category Created!', data: category })
})

/**
 * @desc Update a category
 * @route PATCH /categories/:id
 * @access MANAGER (own outlet), SUPER_ADMIN
 */
export const updateCategory = catchAsyncError(async (req, res) => {
  const categoryId = req.params.id
  const { name, active, order } = req.body

  const updated = await Category.findByIdAndUpdate(
    categoryId,
    { name, active, order },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!updated) return next(new ErrorHandler('Category not found', 404))

  res.json({
    success: true,
    message: `${updated.name} Updated!`,
    data: updated,
  })
})

/**
 * @desc Delete a category
 * @route DELETE /categories/:id
 * @access MANAGER (own outlet), SUPER_ADMIN
 */
export const deleteCategory = catchAsyncError(async (req, res, next) => {
  const categoryId = req.params.id
  if (!categoryId)
    return next(new ErrorHandler('Category Id Is required to delete Category'))

  const item = await Item.find({ category: categoryId })
  if (item.length !== 0) {
    return next(
      new ErrorHandler(
        "Category can't delete , Item available in this category"
      )
    )
  }
  const deleted = await Category.findByIdAndDelete(categoryId)

  if (!deleted) return next(new ErrorHandler('category not found'))

  res.json({ success: true, message: 'Category deleted', data: deleted })
})

/**
 * @desc    Toggle category active status
 * @route   PATCH /categories/:id/toggle
 * @access  MANAGER (own outlet), SUPER_ADMIN
 */
export const toggleCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params

  const category = await Category.findById(id)

  if (!category) return next(new ErrorHandler('Category not found', 404))

  // Toggle active status
  category.active = !category.active
  const updatedCategory = await category.save()

  res.status(200).json({
    success: true,
    message: `${category.name} is now ${
      updatedCategory.active ? 'active' : 'inactive'
    }`,
    data: updatedCategory,
  })
})

export const getMenusCategoryById = catchAsyncError(async (req, res, next) => {
  let { id, page = 1, limit = 10 } = req.params

  page = Number(page) || 1
  limit = Number(limit) || 10
  const skip = (page - 1) * limit

  if (!id) return next(new ErrorHandler('Category ID is required', 400))

  const category = await Category.findById(id)

  if (!category) return next(new ErrorHandler('Category not found', 404))

  const menus = await Item.find({ category: id })
    .populate('createdBy')
    .populate('outlet')
    .skip(skip)
    .limit(limit)

  if (!menus) {
    return next(new ErrorHandler('Menu not found in this category', 404))
  }

  const total = menus.length
  res.status(200).json({
    success: true,
    message: 'Category fetched successfully',
    data: category,
    items: {
      data: menus,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  })
})

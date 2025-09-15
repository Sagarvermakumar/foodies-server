import mongoose from 'mongoose'
import catchAsyncError from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/Error.js'
import Order from '../Models/Order.model.js'

/**
 * @desc    Get assigned orders for delivery partner
 * @route   GET /api/v1/delivery/assigned
 * @access  DELIVERY
 */
export const getAssignedOrders = catchAsyncError(async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query

  page = parseInt(page)
  limit = parseInt(limit)

  const assignedTo = new mongoose.Types.ObjectId(String(req.user.id))
  const activeStatuses = ['ASSIGNED', 'PICKED', 'OUT_FOR_DELIVERY', 'DELIVERED']

  const orders = await Order.find({
    currentOrderStatus: { $in: activeStatuses },
   "delivery.assignedTo": req?.user?._id
  })
    .populate('user')
    .populate('items.item')
    .populate('address')
    .skip((page - 1) * limit)
    .limit(limit)
  if (!orders || orders.length === 0) {
    return next(new ErrorHandler('Order Not Assigned to delivered', 404))
  }

  const total = await Order.countDocuments({
    'delivery.assignedTo': assignedTo,
    currentOrderStatus: 'ASSIGNED',
  })

  res.json({
    success: true,
    message: 'Your Assigned Orders',
    data: orders,
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
 * @desc    Mark order as picked up
 * @route   PATCH /api/v1/delivery/:orderId/pick
 * @access  DELIVERY
 */
export const markOrderPicked = catchAsyncError(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  order.currentOrderStatus = 'PICKED'
  order.statusTimeline.push({
    status: 'PICKED',
    by: req.user._id,
    note: 'I have picked up the order and I am on the way.',
  })
  await order.save()

  res.json({ message: 'Order picked successfully', data: order })
})

/**
 * @desc    Update live location of delivery partner
 * @route   PATCH /api/v1/delivery/:orderId/location
 * @access  DELIVERY
 * @body    { lat: number, lng: number }
 */
export const updateLocation = catchAsyncError(async (req, res) => {
  const { lat, lng } = req.body

  const order = await Order.findById(req.params.orderId)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  order.delivery.liveLocation.coordinates = [lat, lng]
  await order.save()

  res.json({ message: 'Location updated', data: order })
})

/**
 * @desc    Mark order as delivered
 * @route   PATCH /api/v1/delivery/:orderId/delivered
 * @access  DELIVERY
 */
export const markOrderDelivered = catchAsyncError(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  order.currentOrderStatus = 'DELIVERED'
  order.statusTimeline.push({
    status: 'DELIVERED',
    by: req.user._id,
    note: 'I have delivered the order successfully!',
  })
  order.deliveredAt = new Date()
  await order.save()

  res.json({ message: 'Order Marks as delivered successfully', data: order })
})

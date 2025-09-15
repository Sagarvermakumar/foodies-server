import { v4 as uuidv4 } from 'uuid'
import catchAsyncError from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/Error.js'
import Cart from '../Models/Cart.model.js'
import Order, { ORDER_STATUS } from '../Models/Order.model.js'
import User from '../Models/User.model.js'
import { generateInvoicePDF } from '../utils/generateInvoice.js'

/**
 * @desc   Start a new checkout session by generating a unique cartId (UUID).
 *         This ID helps identify the session and prevent duplicate orders.
 */
export const startCheckout = (req, res) => {
  const cartId = uuidv4()
  return res.status(200).json({ cartId })
}

/**
 * @desc    Create order from cart
 */

// Place a new order

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  CUSTOMER
 */
export const createOrder = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id

  const { address, paymentDetails, cartId } = req.body

  const user = await User.findOne(userId).select('status')
  if (user.status === 'blocked') {
    return next(
      new ErrorHandler(
        'Your account has been blocked by the administrator. You are not allowed to place orders.',
        403
      )
    )
  }

  // 1. Get user cart
  const cart = await Cart.findOne({ user: userId })
    .populate('items.item')
    .populate('coupon')

  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler('Cart is empty', 400))
  }

  // 2. Recalculate totals before creating order
  // 3. Create order
  const order = new Order({
    user: userId,
    cartId,
    orderNo: `ORD-${Date.now()}`,
    address: address._id,
    items: cart.items.map((i) => ({
      item: i.item._id,
      name: i.item.name,
      unitPrice: i.priceSnapshot,
      qty: i.qty,
      variation: i.variation || {},
      addons: i.addons || [],
    })),
    outlet: cart.outlet,
    delivery: {
      liveLocation: {
        type: address.location.type,
        coordinates: address.location.coordinates,
      },
    },

    charges: cart.totals,
    coupon: cart.coupon || null,
    payment: {
      method: paymentDetails.method,
      status: paymentDetails.status,
      gateway: paymentDetails.gateway,
      txnId: paymentDetails.txnId || null,
    },
  })

  await order.save()

  // 4. Clear cart after order
  cart.items = []
  cart.coupon = null
  cart.totals = {
    subTotal: 0,
    discount: 0,
    tax: 0,
    deliveryFee: 0,
    grandTotal: 0,
  }
  await cart.save()

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order,
  })
})

/**
 * @desc    Get my orders
 */
export const getMyOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({
      createdAt: -1,
    })
    .populate('items.item')
  res
    .status(200)
    .json({ success: true, message: 'Your all orders fetched!', data: orders })
})

/**
 * @desc    Get single order
 */
export const getOrderById = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.id

  const order = await Order.findById(orderId)
    .populate('items.item')
    .populate('user')
    .populate('outlet', 'name location')
    .populate('address')
  // .populate('delivery.assignedTo', 'name phone')

  if (!order) return next(new ErrorHandler('Order not found', 404))

  // Customer should only see their own order
  if (
   
    order.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorHandler('Access denied', 403))
  }

  // Outlet admin can only see orders of their outlet
  // if (req.user.role === 'SUPER_ADMIN' && order.outlet.toString() !== req.user.outlet.toString()) {
  //   return next(new ErrorHandler('Access denied', 403))
  // }

  res.json({
    success: true,
    message: 'Order details fetched successfully',
    data: order,
  })
})

/**
 * @desc    Get all orders (MANAGER/STAFF)
 */
export const getAllOrders = catchAsyncError(async (req, res) => {
  let { status, date, page = 1, limit = 10, userId, query } = req.query

  page = Number(page) || 1
  limit = Number(limit) || 10

  let filter = {}
  if (status) filter.currentOrderStatus = status
  if (userId) filter.user = userId

  // 📅 Date filter (day wise)
  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    filter.createdAt = { $gte: start, $lte: end }
  }

  // ⚡ First get orders (populate item names)
  let orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .populate('address')
    .populate('items.item').populate('delivery.assignedTo',"name")
    .sort({ createdAt: -1 })
  // 🔍 Apply search filter on item name
  if (query && query.trim() !== '') {
    const regex = new RegExp(query, 'i')
    orders = orders.filter((order) =>
      order.items.some((i) => i.item && regex.test(i.item.name))
    )
  }

  // 📑 Pagination after filtering
  const total = orders.length
  orders = orders.slice((page - 1) * limit, page * limit)

  res.status(200).json({
    success: true,
    message: 'All Orders Fetched',
    data: orders,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  })
})

/**
 * @desc    Update order status
 */
export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.body
  const orderId = req.params.id
  if (!ORDER_STATUS.includes(status)) {
    return next(new ErrorHandler("Invalid Status",400))
  }
  const order = await Order.findById(orderId)
    .populate('user')
    .populate('items.item')
    .populate('address')
  if (!order) next(new ErrorHandler('Order not Found', 404))

  order.currentOrderStatus = status
  order.statusTimeline.push({ status, by: req.user._id })
  await order.save()

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  })
})

/**
 * @desc    Assign delivery staff
 */
export const assignOrderToDelivery = catchAsyncError(async (req, res) => {
  const { deliveryPersonId } = req.body
  const orderId = req.params.id
  const order = await Order.findById(orderId)
  if (!order) return next(new ErrorHandler('Order not Found', 404))

  order.delivery.assignedTo = deliveryPersonId
  order.currentOrderStatus = 'ASSIGNED'
  order.statusTimeline.push({
    status: 'ASSIGNED',
    by: req.user._id,
    note: ' This order has been successfully assigned to the delivery staff for timely delivery to the customer ',
  })
  await order.save()

  res.json({ success: true, message: 'Order Assigned', data: order })
})

/**
 * @desc    Cancel order
 */
export const cancelOrder = catchAsyncError(async (req, res,next) => {
  const { reason, comment } = req.body
  const orderId = req.params.id
  const order = await Order.findById(orderId)
  if (!order) return next(new ErrorHandler('Order not Found', 404))

  if (
    [
      'OUT_FOR_DELIVERY',
      'READY',
      'DELIVERED',
      'CANCELLED',
    ].includes(order.currentOrderStatus)
  ) {
    return next(
      new ErrorHandler(
        `Cannot cancel an order with status: ${order.currentOrderStatus}`,
        400
      )
    )
  }

  // Only the user who placed it can cancel it
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized: Not your order', 403))
  }

  // Only allow cancellation if status is pending or confirmed
  if (order.status === 'cancelled') {
    return next(new ErrorHandler('Order already cancelled', 403))
  }
  order.currentOrderStatus = 'CANCELLED'
  order.cancelled = { isCancelled: true, reason, comment,by: req.user._id }
  order.statusTimeline.push({
    status: 'CANCELLED',
    by: req.user._id,
    note: "Your order has been cancelled as per request/availability",
  })
  await order.save()

  res.json({ success: true, message: 'Order cancelled', data: order })
})

/**
 * @desc    Generate invoice PDF
 */
export const generateInvoice = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
  if (!order) return next(new ErrorHandler('Order not found', 400))

  const pdfBuffer = await generateInvoicePDF(order, res)

  res.setHeader('Content-Type', 'application/pdf')
  res.send(pdfBuffer)
})

/**
 * @desc    Trigger refund
 */
export const processRefund = catchAsyncError(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return next(new ErrorHandler('Order Not Found', 404))

  order.payment.status = 'REFUNDED'
  order.currentOrderStatus = 'REFUNDED'
  order.refundedAt = new Date()
  await order.save()

  res.json({ success: true, order })
})

// Check order status
export const checkOrderStatus = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.id

  const order = await Order.findById(orderId).populate('items.item')

  if (!order) {
    return next(new ErrorHandler('Order not found', 404))
  }

  // Make sure only the user who placed the order can access it
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Unauthorized access', 403))
  }

  res.status(200).json({
    success: true,
    orderStatus: `Your order is currently ${order.currentOrderStatus}`,
  })
})

// Delete a cancelled order
export const deleteCancelledOrder = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.id
  const order = await Order.findById(orderId)

  if (!order) {
    return next(new ErrorHandler('Order not found', 404))
  }

  // Ensure the order is cancelled before deletion
  if (order.currentOrderStatus !== 'CANCELLED') {
    return next(new ErrorHandler('Only cancelled orders can be deleted', 400))
  }

  await order.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
    orderId:order._id,
  })
})

//Re-order (Quick Repeat Order)
export const QuickRepeatOrder = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.id
  const { cartId } = req.body
  const userId = req.user._id

  const previousOrder = await Order.findById(orderId).populate('items.item')
  if (!previousOrder) {
    return next(new ErrorHandler('Previous order not found', 404))
  }


  const cleanOrder = {
    user: userId,
    orderNo: `ORD-${Date.now()}`,
    cartId:cartId,
    items: previousOrder.items.map((item) => ({
      item: item.item._id,
      qty: item.qty,
      unitPrice: item.unitPrice,
      variation: item.variation || null,
      addons: item.addons || [],
    })),
    charges: {
      subTotal: previousOrder.charges.subTotal,
      discount: previousOrder.charges.discount,
      tax: previousOrder.charges.tax,
      deliveryFee: previousOrder.charges.deliveryFee,
      grandTotal: previousOrder.charges.grandTotal,
    },
    address: previousOrder.address,
    paymentMethod: previousOrder.paymentMethod,
    currentOrderStatus: 'PLACED',
  }

  // नया order create करो
  const newOrder = await Order.create(cleanOrder)

  res.status(201).json({
    success: true,
    message: 'Re-order placed successfully',
    order: newOrder,
  })
})

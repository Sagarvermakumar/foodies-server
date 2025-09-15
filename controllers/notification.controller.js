import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ErrorHandler from "../Middleware/Error.js";
import Notification from "../Models/Notification.model.js"; // assume Notification schema created
import Order from "../Models/Order.model.js";
/**
 * @desc    Push a general notification
 * @route   POST /api/v1/notifications/push
 * @access  MANAGER, SUPER_ADMIN
 * @use     This endpoint allows managers or super admins to push a general notification 
 *          to users (like offers, updates, announcements).
 */
  export const pushNotification = catchAsyncError(async (req, res) => {
      const { title, message, targetUsers ,type} = req.body || {};
      console.log({title, message, targetUsers ,type})
      const notification = await Notification.create({
        title,
        message,
        recipientRoles:targetUsers ,
        type
      });
      return res.status(201).json({
        success: true,
        message: "Notification pushed successfully",
        data: notification,
      });
    
  });

/**
 * @desc    Send notification for a specific order
 * @route   POST /api/v1/notifications/order/:id
 * @access  MANAGER, STAFF
 * @use     This endpoint allows managers or staff to send notifications related to an order 
 *          (e.g., order accepted, out for delivery, delivered).
 */
export const sendOrderNotification = async (req, res,next) => {
    const { id } = req.params;
    const { status, message } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new ErrorHandler('Order not found',404))
    }

    const notification = await Notification.create({
      title: `Order Update: ${status}`,
      message,
      orderId: order._id,
      type: "ORDER",
      targetUsers: [order.user], // assuming order has customer field
    });

    return res.status(201).json({
      success: true,
      message: "Order notification sent successfully",
      data: notification,
    });

};

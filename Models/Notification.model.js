import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "order", "system", "promo"], // SYSTEM = push, ORDER = order-specific
      default: "info",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", 
      required: function () {
        return this.type === "ORDER";
      },
    },
    recipientRoles: {
      type: [String],
      enum: ["ALL","SUPER_ADMIN", "MANAGER", "STAFF", "DELIVERY", "CUSTOMER"],
      default: ["ALL"], 
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

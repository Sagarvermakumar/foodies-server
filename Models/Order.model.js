import { model, Schema } from "mongoose";
export const ORDER_STATUS = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "ASSIGNED",
  "PICKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "COMPLETE",
];

const StatusEventSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUS, required: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item" },
    name: String,
    qty: Number,
    variation: { name: String, price: Number },
    addons: [{ name: String, price: Number }],
    unitPrice: Number,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    cartId: {
      type: String,
      required: [true, "Cart Id is required"],
      unique: true,
    },
    orderNo: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    outlet: { type: Schema.Types.ObjectId, ref: "Outlet", index: true },
    address: { type: Schema.Types.ObjectId, ref: "Address" },
    items: [OrderItemSchema],
    note: String,
    statusTimeline: [StatusEventSchema],
    currentOrderStatus: { type: String, enum: ORDER_STATUS, default: "PLACED" },
    payment: {
      method: {
        type: String,
        enum: ["COD", "CARD", "UPI", "WALLET"],
        default: "COD",
      },
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      gateway: {
        type: String,
        enum: ["RAZORPAY", "STRIPE", "PAYPAL", "NONE"],
        default: "NONE",
      },
      txnId: String,
    },
    charges: {
      subTotal: Number,
      discount: Number,
      tax: Number,
      deliveryFee: Number,
      grandTotal: Number,
    },
    delivery: {
      assignedTo: { type: Schema.Types.ObjectId, ref: "User", default:null }, // DELIVERY role
      etaMinutes: Number,
      liveLocation: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    refundedAt: Date,
    cancelled: {
      isCancelled: { type: Boolean, default: false },
      reason: String,
      by: { type: Schema.Types.ObjectId, ref: "User" },
      comment:{
        type:String,
        default:null
      }
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ "delivery.liveLocation": "2dsphere" });

const Order = model("Order", OrderSchema);
export default Order;

import { Schema, model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, unique: true, uppercase: true },
    title: String,
    description: String,
    type: { type: String, enum: ["PERCENT", "FLAT"], default: "PERCENT" },
    value: Number,
    minOrder: Number,
    maxDiscount: Number,
    startAt: Date,
    endAt: Date,
    active: { type: Boolean, default: true },
    usageLimit: Number, // global
    perUserLimit: Number,
  },
  { timestamps: true }
);

const Coupon = model.Coupon || model("Coupon", CouponSchema);

export default Coupon;

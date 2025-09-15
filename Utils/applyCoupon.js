/**
 * @desc    Apply coupon discount calculation
 * @param   {String} code - Coupon code
 * @param   {Number} subTotal - Order subtotal before discount
 * @param   {String} userId - Current logged-in user ID
 * @returns {Object} { success, discount, message, couponId }
 */

import Coupon from "../Models/Coupon.model.js";
import Order from "../Models/Order.model.js";

export const applyCouponDiscount = async (code, subTotal, userId) => {
  const now = new Date();
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    return { success: false, discount: 0, message: "Invalid or inactive coupon" };
  }

  // ⏳ Date validity checks
  if (coupon.startDate && now < coupon.startDate) {
    return { success: false, discount: 0, message: "Coupon not yet active" };
  }
  if (coupon.endDate && now > coupon.endDate) {
    return { success: false, discount: 0, message: "Coupon has expired" };
  }

  // 💰 Min order check
  if (coupon.minOrderAmount && subTotal < coupon.minOrderAmount) {
    return {
      success: false,
      discount: 0,
      message: `Minimum order value should be ₹${coupon.minOrderAmount}`,
    };
  }

  // 👤 Per-user usage limit
  if (coupon.maxUsesPerUser) {
    const userUsageCount = await Order.countDocuments({
      user: userId,
      coupon: coupon._id,
    });

    if (userUsageCount >= coupon.maxUsesPerUser) {
      return { success: false, discount: 0, message: "Coupon usage limit reached for this user" };
    }
  }

  // 🌍 Global usage limit
  if (coupon.maxUses) {
    const totalUsageCount = await Order.countDocuments({ coupon: coupon._id });

    if (totalUsageCount >= coupon.maxUses) {
      return { success: false, discount: 0, message: "Coupon usage limit reached" };
    }
  }

  // 🧮 Discount calculation
  let discount = 0;
  if (coupon.type === "PERCENT") {
    discount = (subTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === "FLAT") {
    discount = coupon.value;
  }

  // ⚠️ Prevent over-discount (never exceed subTotal)
  if (discount > subTotal) discount = subTotal;

  return {
    success: true,
    discount,
    couponId: coupon._id,
    message: `Coupon applied successfully. You saved ₹${discount}`,
  };
};

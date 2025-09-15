/**
 *  Calculates the totals for a shopping cart including subtotal, discount, tax, delivery fee, and grand total.
 * @param {Object} cart - The shopping cart object
 * @returns {Object|null} - The calculated totals or null if cart is invalid
 */

const getCouponDiscount = (coupon, subTotal) => {
  if (!coupon?.active) return 0
  const now = new Date()
  if (
    (coupon.startAt && now < coupon.startAt) ||
    (coupon.endAt && now > coupon.endAt)
  )
    return 0
  if (coupon.minOrder && subTotal < coupon.minOrder) return 0

  let discount =
    coupon.type === 'PERCENT' ? (subTotal * coupon.value) / 100 : coupon.value

  return Math.min(discount, coupon.maxDiscount || discount)
}

export const calculateCartTotals = async (cart) => {
  if (!cart.items || cart.items.length === 0) {
    cart.totals = {
      subTotal: 0,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      grandTotal: 0,
    }
    return cart
  }

  // Step 1: Calculate subtotal & item discounts
  let subTotal = 0
  let itemLevelDiscount = 0

  cart.items.forEach((i) => {
    const basePrice = Number(i.priceSnapshot || 0)
    const qty = Number(i.qty || 0)

    const addonsTotal =
      i.addons?.reduce((aSum, addOn) => aSum + Number(addOn.price || 0), 0) || 0

    const lineTotal = (basePrice + addonsTotal) * qty

    // Item level discount (percentage)
    const discountAmount = i.item?.discount
      ? (lineTotal * Number(i.item.discount)) / 100
      : 0

    itemLevelDiscount += discountAmount
    subTotal += lineTotal - discountAmount
  })

  // Step 2: Coupon discount
  let couponDiscount = 0
  if (cart.coupon) {
    const coupon = cart.coupon.value
      ? cart.coupon // populated coupon object
      : null

    if (coupon) {
      if (coupon.type === 'PERCENT') {
        couponDiscount = (subTotal * coupon.value) / 100
      } else {
        couponDiscount = coupon.value
      }
      if (coupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, coupon.maxDiscount)
      }
    }
  }

  // Step 3: Final totals
  const totalDiscount = itemLevelDiscount + couponDiscount
  const tax = ((subTotal - couponDiscount) * 0.05).toFixed(2) // 5% GST
  const deliveryFee = subTotal > 500 ? 0 : 40
  const grandTotal =
    subTotal - couponDiscount + Number(tax) + Number(deliveryFee)

  cart.totals = {
    subTotal: subTotal.toFixed(2),
    discount: totalDiscount.toFixed(2),
    tax: Number(tax),
    deliveryFee,
    grandTotal: grandTotal.toFixed(2),
  }

  return cart
}

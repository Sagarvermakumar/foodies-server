import { Schema, model } from 'mongoose';

const CartItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Item' },
  qty: { type: Number, default: 1 },
  variation: { name: String, price: Number },
  addons: [{ name: String, price: Number }],
  priceSnapshot: Number, // unit price captured when added
});


const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  items: [CartItemSchema],
  coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet' },
  totals: {
    subTotal: Number,
    discount: Number,
    tax: Number,
    deliveryFee: Number,
    grandTotal: Number,
  }
}, { timestamps: true });



const Cart = model.Cart || model("cart",CartSchema)

export default Cart;
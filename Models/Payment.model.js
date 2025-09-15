import { model, Schema } from "mongoose";

// models/Payment.model.ts
const PaymentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  gateway: { type: String, enum: ['RAZORPAY','STRIPE','PAYPAL','WALLET'] },
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['CREATED','SUCCESS','FAILED','REFUNDED'], index: true },
  providerPayload: Schema.Types.Mixed, // webhook snapshot
}, { timestamps: true });

const Payment= model('Payment', PaymentSchema);


export default Payment
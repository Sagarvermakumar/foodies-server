import mongoose, { model, Schema } from "mongoose";

const OutletSchema = new Schema({
  name: { type: String, required: [true,"Outlet name is required"] },
  code: { type: String, unique: true },
  address: {   type: Schema.Types.ObjectId,
      ref: "Address",
      required: [true, "Address Is required is required"],
  },
  phone: String,
  openingHours: { open: String, close: String, weeklyOff: [String] }, // 0-6
  deliveryCharges: { type: String, enum: ['FIXED','PER_KM','FREE_ABOVE'], default: 'FIXED' },
  deliveryConfig: { fixed: Number, perKm: Number, freeAbove: Number },
  gstIN: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Outlet = mongoose.models.Outlet || model('Outlet', OutletSchema);
export default Outlet
import { model, Schema } from "mongoose";

const VariationSchema = new Schema({
  name: String, // e.g., "Regular", "Large"
  price: { type: Number, required: true },
  maxAddons: { type: Number, default: 0 },
});

const AddonSchema = new Schema({
  name: String, // "Extra cheese", "Spice level: Hot"
  price: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ["TOPPING", "OPTION", "SPICE"],
    default: "TOPPING",
  },
});

const ItemSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    slug: { type: String, unique: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    description: { type: String, required: [true, "Description is required"] },
    image: { type: String, required: [true, "Image URL is required"] },
    isVeg: { type: Boolean, default: false },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    variations: [VariationSchema],
    addons: [AddonSchema],
    discount: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    outlet: { type: Schema.Types.ObjectId, ref: "Outlet", index: true },
  },
  { timestamps: true }
);

ItemSchema.index({ name: "text", description: "text" });

const Item = model("Item", ItemSchema);

export default Item;

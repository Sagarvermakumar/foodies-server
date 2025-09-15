import { model, Schema } from "mongoose";

// Address Schema for storing user addresses
const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Other",
    },

    addressLine: {
      type: String,
      required: [true, "Address line is required"],
    },

    // Extra structured fields
    street: { type: String },          
    landmark: { type: String },        
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },         
    country: { type: String, default: "India" },

    // GeoJSON format for coordinates
    location: { 
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], require:[true, "location coordinates required"] } // [lng,lat]
    },

    // Extra for delivery logic
    contactName: { type: String },     // Person name for delivery
    contactPhone: { type: String },    // Alternate phone number
    instructions: { type: String },    // Delivery notes (e.g., "3rd floor, ring bell")

    isDefaultAddress: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ location: '2dsphere' });

const Address = model("Address", addressSchema);
export { addressSchema };
export default Address;

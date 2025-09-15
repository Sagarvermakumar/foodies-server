import { model, Schema } from "mongoose";


const otpSchema = new Schema({
  identifier: { // Email ya phone
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ["login", "forgot_password", "verify_email", "verify_phone"],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// OTP expire hone par auto delete (Mongo TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = model("Otp", otpSchema);

export default OTP;


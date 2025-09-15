import { model, Schema } from "mongoose";


const resetTokenSchema = new Schema({
  identifier: { // Email ya phone
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ["password-reset"],
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
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ResetToken = model("ResetToken", resetTokenSchema);

export default ResetToken;


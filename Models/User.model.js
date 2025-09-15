
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose,{ Schema } from "mongoose";
import { config } from "../config/env.js";

const userSchema = new Schema(
  {
      avatar: {
        public_id: {
          type:String,
          default :"Public_id"
        },
        url: {
          type:String,
          default:"user.png"
        },
    },
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim:true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      match: [/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
      trim:true,
      sparse:true,
      lowercase:true,
    },
    password: {
      type: String,
      required: [true, "Please Enter your Password"],
      minLength: [6, "password must be at least 6 character"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Please enter Phone Number"],
      match: [
        /^\+91[6-9]\d{9}$/,
        "Please enter a valid phone number with country code",

      ],
      unique: true,
      index: true, 
      sparse: true,
    },
    outlets: [{ type: Schema.Types.ObjectId, ref: 'Outlet' }],
    referralCode: {
      type: String,
      unique: true,
      default: null,
    }, 
    referredBy: {
      type: String,
      default: null,
    }, 
    walletBalance: {
      type: Number,
      default: 0,
    },

 role: {
    type: String,
    enum: ['SUPER_ADMIN','MANAGER','STAFF','DELIVERY','CUSTOMER'],
    default: 'CUSTOMER',
    index: true,
  },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,

  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, outlets: 1 });
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE || "30d",
  });
};

userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = token;
  return token;
};
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

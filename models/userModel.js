import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    phonenumber: {
      type: String,
      required: true,
      unique: true,
    },
    optVerified: {
      type: Boolean,
      default: false,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    passResetOtp: {
      type: String,
      required: false,
    },
    passResetOtpExpiry: {
      type: Date,
      required: false,
    },

    password: {
      type: String,
      trim: true,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export const User = mongoose.model("User", userSchema);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  username: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  password: {
    trim: true,
    type: String,
    required: true,
  },
  otp: {
    trim: true,

    type: String,
  },
  role: {
    enum: ["user", "admin"],
    default: "admin",
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  avatar: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export const Admin = mongoose.model("Admin", AdminSchema);

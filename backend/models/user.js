// File: models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // clerkUserId and googleId have been removed.

    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // Password is now always required.
    },
    photo: {
      type: String,
      // It's better to handle a default on the frontend
      // or leave it null/undefined in the database.
      default: null,
    },

    passwordResetOTP: {
      type: String, // We'll store the HASHED OTP here
    },
    passwordResetOTPExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

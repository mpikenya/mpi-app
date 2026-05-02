// src/models/Testimonial.js
const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    imageUrl: { type: String },
    cloudinaryId: { type: String },
  },
  { timestamps: true }
);

// 👇 This line compiles the schema into a model
module.exports = mongoose.model("Testimonial", testimonialSchema);


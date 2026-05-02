// src/models/Partner.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const PartnerSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partner', PartnerSchema);

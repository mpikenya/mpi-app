const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
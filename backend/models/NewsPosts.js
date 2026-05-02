// models/NewsPost.js
const mongoose = require('mongoose');

const newsPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required.'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required.'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required.'],
  },
  // Image fields are not required
  imageUrl: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('NewsPost', newsPostSchema);
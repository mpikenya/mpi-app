
// src/controllers/testimonialController.js
const Testimonial = require('../models/Testimonials.js');
const cloudinary = require('../config/cloudinary.js');
const DatauriParser = require('datauri/parser.js');
const path = require('path');

// Helper function to convert buffer to data URI
const parser = new DatauriParser();
const formatBufferToDataUri = (file) =>
  parser.format(path.extname(file.originalname).toString(), file.buffer);

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Private (Admin)
const createTestimonial = async (req, res) => {
  try {
    const { name, text } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    if (!name || !text) {
      return res
        .status(400)
        .json({ message: 'Reviewer name and testimonial text are required.' });
    }

    // Upload image to Cloudinary
    const fileDataUri = formatBufferToDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileDataUri.content, {
      folder: 'mpi_testimonials',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      transformation: [
        { width: 100, height: 100, crop: 'fill', gravity: 'face' },
        { quality: 'auto:eco' },
      ],
    });

    const newTestimonial = new Testimonial({
      name,
      text,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
    });

    await newTestimonial.save();
    res.status(201).json({
      message: 'Testimonial created successfully',
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin)
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found.' });
    }

    await cloudinary.uploader.destroy(testimonial.cloudinaryId);
    await Testimonial.findByIdAndDelete(id);

    res.status(200).json({ message: 'Testimonial deleted successfully.' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  createTestimonial,
  getTestimonials,
  deleteTestimonial,
};

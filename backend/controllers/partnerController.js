// src/controllers/partnerController.js
const Partner = require('../models/Partners.js');
const cloudinary = require('../config/cloudinary.js');
const DatauriParser = require('datauri/parser.js');
const path = require('path');

const parser = new DatauriParser();
const formatBufferToDataUri = (file) =>
  parser.format(path.extname(file.originalname).toString(), file.buffer);

// @desc    Create a new partner
// @route   POST /api/partners
// @access  Private (Admin)
const createPartner = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Partner name is required.' });
    }

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ name });
    if (existingPartner) {
      return res
        .status(409)
        .json({ message: 'Partner with this name already exists.' });
    }

    // Upload image to Cloudinary
    const fileDataUri = formatBufferToDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileDataUri.content, {
      folder: 'mpi_partners',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: 'limit' },
        { quality: 'auto:eco' },
      ],
    });

    const newPartner = new Partner({
      name,
      description,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
    });

    await newPartner.save();
    res
      .status(201)
      .json({ message: 'Partner created successfully', partner: newPartner });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all partners
// @route   GET /api/partners
// @access  Public
const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ name: 1 });
    res.status(200).json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete partner
// @route   DELETE /api/partners/:id
// @access  Private (Admin)
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found.' });
    }

    if (partner.cloudinaryId) {
      await cloudinary.uploader.destroy(partner.cloudinaryId);
    }

    await Partner.findByIdAndDelete(id);
    res.status(200).json({ message: 'Partner deleted successfully.' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  createPartner,
  getPartners,
  deletePartner,
};

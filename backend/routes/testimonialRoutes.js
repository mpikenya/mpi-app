// src/routes/testimonialRoutes.js
// src/routes/testimonialRoutes.js
const express = require('express');
const {
  createTestimonial,
  getTestimonials,
  deleteTestimonial,
} = require('../controllers/testimonialController.js');

const verifyAdmin = require('../middlewares/verifyAdmin.js');
const upload = require('../middlewares/multer.js');

const router = express.Router();

// Protect these routes with admin authentication
router.post('/', verifyAdmin, upload.single('image'), createTestimonial);
router.get('/', getTestimonials); // Public endpoint for home screen
router.delete('/:id', verifyAdmin, deleteTestimonial);

module.exports = router;



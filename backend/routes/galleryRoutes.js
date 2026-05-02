const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { uploadImage, getAllImages, deleteImage } = require('../controllers/galleryController');
const protectAdmin = require('../middlewares/verifyAdmin.js');

// Admin route to upload images
router.post('/admin', protectAdmin, upload.array('images', 10), uploadImage);

// Public route to get all images
router.get('/', getAllImages);

// Admin route to delete an image
router.delete('/admin/:id', protectAdmin, deleteImage);

module.exports = router;


const express = require('express');
const { createPartner, getPartners, deletePartner } = require('../controllers/partnerController');
const verifyAdmin = require('../middlewares/verifyAdmin'); // 👈 your middleware
const upload = require('../middlewares/multer'); 

const router = express.Router();

// Protect these routes with admin authentication
router.post('/', verifyAdmin, upload.single('image'), createPartner);
router.get('/', getPartners); // Public endpoint for home screen
router.delete('/:id', verifyAdmin, deletePartner);

module.exports = router;

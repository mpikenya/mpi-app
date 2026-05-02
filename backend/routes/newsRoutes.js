const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const protectAdmin = require('../middlewares/verifyAdmin.js');
const { createPost, getAllPosts, getPostById, deletePost } = require('../controllers/newsController');

// Admin route to create a post
router.post('/admin', protectAdmin, upload.single('image'), createPost);

// Public route to get all posts
router.get('/', getAllPosts);

// Public route to get a single post by its ID
router.get('/:id', getPostById);

// Admin route to delete a post
router.delete('/admin/:id', protectAdmin, deletePost);

module.exports = router;

// controllers/newsController.js
const cloudinary = require('../config/cloudinary');

const NewsPosts = require('../models/NewsPosts');

// 1. CREATE a new news post
exports.createPost = async (req, res) => {
  try {
    const { title, content, date } = req.body;

    if (!title || !content || !date) {
      return res.status(400).json({ message: 'Title, content, and date are required.' });
    }

    const newPostData = { title, content, date };

    // Check if an image file was uploaded
    if (req.file) {
      // If so, upload it to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "news_posts" }, (error, result) => {
          if (error || !result) return reject(error || new Error("Cloudinary upload failed."));
          resolve(result);
        }).end(req.file.buffer);
      });
      
      newPostData.imageUrl = result.secure_url;
      newPostData.cloudinaryId = result.public_id;
    }
    
    // Create and save the new post (with or without image fields)
    const newPost = new NewsPosts(newPostData);
    await newPost.save();

    res.status(201).json({ message: 'News post created successfully!', post: newPost });

  } catch (error) {
    console.error('Error creating news post:', error);
    res.status(500).json({ message: 'Server error while creating post.' });
  }
};

// 2. GET all news posts
exports.getAllPosts = async (req, res) => {
  try {
    // Sort by the event/news date in descending order (newest first)
    const posts = await NewsPosts.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch news posts.' });
  }
};

// 3. GET a single news post by its ID
exports.getPostById = async (req, res) => {
  try {
    const post = await NewsPosts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'News post not found.' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch news post.' });
  }
};

// Paste this at the end of controllers/newsController.js

/**
 * @desc    Delete a news post by its ID
 * @route   DELETE /api/admin/news/:id
 * @access  Private/Admin
 */
exports.deletePost = async (req, res) => {
  try {
    // Step 1: Find the news post document in MongoDB using the ID from the URL.
    // e.g., if the request is to /api/admin/news/12345, req.params.id will be "12345".
    const post = await NewsPosts.findById(req.params.id);

    // If no post is found with that ID, return a 404 error.
    if (!post) {
      return res.status(404).json({ message: 'News post not found.' });
    }

    // Step 2: Check if the post has an image stored in Cloudinary.
    // This is important because the image is optional for news posts.
    if (post.cloudinaryId) {
      // If it exists, command Cloudinary to destroy (delete) the image file
      // using its unique public ID. This saves your storage space.
      await cloudinary.uploader.destroy(post.cloudinaryId);
    }

    // Step 3: After handling the Cloudinary image, delete the post document
    // from your MongoDB database.
    await NewsPosts.findByIdAndDelete(req.params.id);

    // Step 4: Send a success confirmation back to the frontend.
    res.status(200).json({ message: 'News post deleted successfully.' });

  } catch (error) {
    // If any step fails, catch the error and send a generic server error response.
    console.error('Error deleting news post:', error);
    res.status(500).json({ message: 'Server error while deleting post.' });
  }
};
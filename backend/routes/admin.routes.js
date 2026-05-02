const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middlewares/verifyAdmin");
const { addAdmin } = require('../controllers/adminController');

// Models
const Admin = require("../models/Admin");
const News = require('../models/NewsPosts');
const Gallery = require('../models/GalleryImage');
const User = require('../models/user');
const Partner = require('../models/Partners');          // ✅ add Partner model
const Testimonial = require('../models/Testimonials');  // ✅ add Testimonial model

// Add new admin
router.post('/add-admin', verifyAdmin, addAdmin);

// Fetch all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); 
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User removed successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Get all admins
router.get('/personnel', verifyAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password');
    res.json(admins);
  } catch (error) {
    console.error("Error fetching admin personnel:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Dashboard (profile)
router.get("/dashboard", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id; 
    const admin = await Admin.findById(adminId).select("-password"); 
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [
      newsCount,
      imageCount,
      partnerCount,
      testimonialCount
    ] = await Promise.all([
      News.countDocuments(),
      Gallery.countDocuments(),
      Partner.countDocuments(),
      Testimonial.countDocuments()
    ]);

    // Recent uploads (example: last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = await News.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      totalNews: newsCount,
      totalImages: imageCount,
      totalPartners: partnerCount,         // ✅ added
      totalTestimonials: testimonialCount, // ✅ added
      recentUploadsCount: recentUploads,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error while fetching stats." });
  }
});

module.exports = router;

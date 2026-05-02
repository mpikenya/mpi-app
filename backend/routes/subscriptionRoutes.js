const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { verifyToken } = require('../middlewares/verifyUser'); // We'll create this middleware next

// --- PROTECTED ROUTES (Require Authentication) ---

// Subscribe a user
router.post('/', verifyToken, async (req, res) => {
  try {
    const existingSubscription = await Subscription.findOne({ userId: req.user.id });
    if (existingSubscription) {
      return res.status(409).json({ message: 'User is already subscribed.' });
    }
    const newSubscription = new Subscription({ userId: req.user.id });
    await newSubscription.save();
    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

// Unsubscribe a user
router.delete('/', verifyToken, async (req, res) => {
  try {
    const result = await Subscription.deleteOne({ userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }
    res.status(200).json({ message: 'Unsubscribed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

// Check subscription status for the logged-in user
router.get('/status', verifyToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

// --- PUBLIC ROUTE ---

// Get total subscriber count
router.get('/count', async (req, res) => {
  try {
    const count = await Subscription.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

module.exports = router;
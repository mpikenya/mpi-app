// controllers/subscriptionController.js
const Subscription = require('../models/Subscription');
const User = require('../models/user'); // We need this to get the user ID

// 1. SUBSCRIBE a user
exports.subscribe = async (req, res) => {
  try {
    // req.user.id will come from your authentication middleware (e.g., protectAdmin/verifyAdmin)
    const userId = req.user.id; 

    // Check if a subscription for this user already exists
    const existingSubscription = await Subscription.findOne({ user: userId });
    if (existingSubscription) {
      return res.status(409).json({ message: 'User is already subscribed.' });
    }

    // Create a new subscription
    const newSubscription = new Subscription({ user: userId });
    await newSubscription.save();

    res.status(201).json({ message: 'Subscription successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during subscription.' });
  }
};

// 2. UNSUBSCRIBE a user
exports.unsubscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Subscription.findOneAndDelete({ user: userId });

    if (!result) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    res.status(200).json({ message: 'Unsubscribed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during unsubscription.' });
  }
};

// 3. GET the total subscriber count (Public)
exports.getSubscriberCount = async (req, res) => {
  try {
    const count = await Subscription.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscriber count.' });
  }
};

// 4. CHECK if the current user is subscribed (Private)
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Subscription.findOne({ user: userId });
    // `!!subscription` is a neat trick to convert the result (or null) to a boolean
    res.status(200).json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscription status.' });
  }
};
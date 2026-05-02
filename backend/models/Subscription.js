// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Link to the user who is subscribing.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This MUST match the name you used for your User model
    required: true,
    unique: true, // A user can only appear in this collection ONCE.
  },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
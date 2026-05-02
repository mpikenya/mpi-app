// File: routes/auth.routes.js

const express = require('express');
const router = express.Router();

// 1. Import your finished controller
// Make sure the path and filename are correct (e.g., auth.controller.js)
const authController = require('../controllers/authController');
router.post('/admin', authController.adminLogin);
// --- Standard Authentication Routes ---

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);


// --- NEW Password Reset Flow Routes ---

// @route   POST /api/auth/request-password-reset
// Step 1: User provides email to request an OTP
router.post('/request-password-reset', authController.requestPasswordReset);

// @route   POST /api/auth/verify-otp
// Step 2: User provides email and OTP to get a temporary reset token
router.post('/verify-otp', authController.verifyOtp);

// @route   POST /api/auth/reset-password
// Step 3: User provides the temporary token and a new password
router.post('/reset-password', authController.resetPassword);


module.exports = router;
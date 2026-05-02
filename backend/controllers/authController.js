// File: controllers/auth.controller.js
// At the top of controllers/auth.controller.js


const User = require('../models/user'); // CORRECTED: Use capital 'U'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../routes/utils/sendEmail');
const Admin = require('../models/Admin'); // Import Admin model for admin login


require('dotenv').config();

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." });
    }

    try {
        // 1. Find the admin by email in the 'admins' collection
        const admin = await Admin.findOne({ email });
        if (!admin) {
            // Use a generic message for security
            return res.status(401).json({ message: 'Invalid credentials or server error.' });
        }

        // 2. Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials or server error.' });
        }

        // 3. If credentials are correct, create a JWT payload
        const payload = {
            user: {
                id: admin.id,
                role: 'admin' // Explicitly set the role
            }
        };

        // 4. Sign the token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Admins might have a shorter session
        );

        // 5. Send the token back to the frontend
        //    This { token } structure matches your React Native code's expectations.
        res.json({ token });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: 'Server error during admin login.' });
    }
};
// --- Your existing Register and Login functions (cleaned up) ---

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'A user with that email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ name, email, password: hashedPassword });
        await user.save();
        const payload = { id: user.id, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        const userResponse = await User.findById(user.id).select('-password');
        res.status(201).json({ token, user: userResponse });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const payload = { id: user.id, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        const userResponse = await User.findById(user.id).select('-password');
        res.json({ token, user: userResponse });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// --- REFINED PASSWORD RESET FLOW ---

/**
 * @desc    Step 1: Request a password reset OTP
 * @route   POST /api/auth/request-password-reset
 */
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            // SECURITY: Always send a success response to prevent user enumeration
            return res.status(200).json({ 
                message: 'If a user with that email is registered, a reset code has been sent.',
                canProceed: false 
            });
        }

        const otp = generateOTP();
        
        // Hash the OTP before saving for security
        user.passwordResetOTP = await bcrypt.hash(otp, 10);
        user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        await user.save();

        const messageHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Password Reset Code</h2>
                <p>You requested a password reset. Please use the code below to proceed.</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
                <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Your MPI Kenya Password Reset Code',
            html: messageHtml,
            message: `Your password reset code is ${otp}. It is valid for 10 minutes.`
        });

        res.status(200).json({ 
            message: 'If a user with that email is registered, a reset code has been sent.',
            canProceed: true // The hidden flag for the frontend
        });

    } catch (error) {
        console.error("Request Password Reset Error:", error);
        res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
};


/**
 * @desc    Step 2: Verify the provided OTP
 * @route   POST /api/auth/verify-otp
 */
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({
            email,
            passwordResetOTPExpires: { $gt: Date.now() },
        });

        if (!user || !user.passwordResetOTP) {
            return res.status(400).json({ message: 'Invalid OTP or it has expired. Please try again.' });
        }

        const isMatch = await bcrypt.compare(otp, user.passwordResetOTP);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP or it has expired. Please try again.' });
        }

        // OTP is correct. Generate a temporary, single-use token for the final reset step.
        const resetPasswordToken = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '10m' } // This token is also valid for 10 minutes
        );
        
        // Clear the OTP from the database so it cannot be reused
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpires = undefined;
        await user.save();

        res.status(200).json({ resetPasswordToken });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};


/**
 * @desc    Step 3: Reset the password using the temporary token
 * @route   POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
    const { resetPasswordToken, password } = req.body;
    
    if (!resetPasswordToken || !password) {
        return res.status(400).json({ message: 'Missing token or new password.' });
    }

    try {
        // Verify the temporary token
        const decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token. User not found.' });
        }

        // Set the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(200).json({ message: 'Password has been updated successfully.' });
        
    } catch (error) {
        console.error("Reset Password Error:", error);
        // This will catch expired or invalid JWTs
        res.status(401).json({ message: 'Your session has expired. Please start the password reset process again.' });
    }
};
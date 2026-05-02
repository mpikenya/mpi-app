const User = require('../models/user'); // Import your User model
const cloudinary = require('../config/cloudinary'); // Import your Cloudinary config

exports.uploadProfilePicture = async (req, res) => {
    try {
        // `req.user.id` is attached by our new `verifyToken` middleware
        const userId = req.user.id; 
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        // Upload the image from the buffer to Cloudinary
        // This is a more modern way to handle the stream
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "profile_pictures" }, // Optional: organize uploads in Cloudinary
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            stream.end(req.file.buffer);
        });

        // Find the user and update their photo URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { photo: result.secure_url },
            { new: true } // This option returns the updated document
        ).select('-password'); // Exclude the password from the response

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ 
            message: 'Profile picture updated successfully!',
            user: updatedUser 
        });

    } catch (error) {
        console.error("Error uploading profile picture:", error);
        res.status(500).json({ message: 'Server error while uploading image.' });
    }
};
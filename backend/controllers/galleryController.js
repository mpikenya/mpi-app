const cloudinary = require('../config/cloudinary');
const GalleryImage = require('../models/GalleryImage');

/**
 * @desc    Upload one or more images to the gallery
 * @route   POST /api/admin/gallery
 * @access  Private/Admin
 */
exports.uploadImage = async (req, res) => {
  try {
    // 1. Check for incoming files from Multer (which provides `req.files`)
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image file is required.' });
    }

    // 2. Check for the caption, which applies to all images in this batch
    const { caption } = req.body;
    if (!caption) {
      return res.status(400).json({ message: 'A caption for the batch is required.' });
    }

    // 3. Helper function to upload a single file buffer to Cloudinary.
    // We wrap the callback-based `upload_stream` in a Promise for async/await.
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "gallery", resource_type: "image" }, // Optional: organize uploads in a 'gallery' folder
          (error, result) => {
            if (error || !result) {
              // If there's an error or no result, reject the promise
              return reject(error || new Error("Cloudinary upload failed."));
            }
            // If successful, resolve the promise with the result data
            resolve(result);
          }
        );
        // Start the upload stream by writing the file buffer to it
        uploadStream.end(fileBuffer);
      });
    };

    // 4. Create an array of upload promises by mapping over the files array
    const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));

    // 5. Execute all uploads in parallel and wait for ALL to complete.
    // `Promise.all` is highly efficient for this.
    const uploadResults = await Promise.all(uploadPromises);

    // 6. Prepare an array of new image documents for the database
    const newImagesForDb = uploadResults.map(result => ({
      imageUrl: result.secure_url,
      caption: caption, // Apply the same caption to each image in this batch
      cloudinaryId: result.public_id,
    }));

    // 7. Use `insertMany` for a single, efficient database operation to save all new images
    const savedImages = await GalleryImage.insertMany(newImagesForDb);

    // 8. Send a success response
    res.status(201).json({
      message: `${savedImages.length} image(s) uploaded successfully!`,
      images: savedImages,
    });

  } catch (error) {
    console.error('Server error during multi-image upload:', error);
    res.status(500).json({ message: 'An error occurred on the server during upload. Please try again.' });
  }
};


/**
 * @desc    Get all gallery images
 * @route   GET /api/gallery
 * @access  Public
 */
exports.getAllImages = async (req, res) => {
  try {
    // Fetch all images from the database, sorted with the newest ones first
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error('Failed to fetch images:', error);
    res.status(500).json({ message: 'Failed to fetch images from the gallery.' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    // 1. Find the image record in the database using the ID from the URL parameter
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // 2. Delete the image from Cloudinary using its stored public_id
    // This is the CRUCIAL step to save storage space
    await cloudinary.uploader.destroy(image.cloudinaryId);

    // 3. Delete the image record from the MongoDB database
    await GalleryImage.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Image deleted successfully.' });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error while deleting image.' });
  }
};
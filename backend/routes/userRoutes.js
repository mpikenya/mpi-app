const express = require('express');
const router = express.Router();

// --- Import your new and updated middleware ---
const verifyToken = require('../middlewares/verifyUser'); // Your custom JWT verifier
const upload = require('../middlewares/multer'); // Your multer configuration

// --- Import your new controller ---
const userController = require('../controllers/userController');


router.post(
  '/profile-picture',
  verifyToken,                  // Step 1: Check if the user is logged in and token is valid.
  upload.single('profileImage'),// Step 2: Use multer to parse the incoming image file.
  userController.uploadProfilePicture // Step 3: Pass control to the controller logic.
);



module.exports = router;
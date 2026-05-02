const express = require("express");
const router = express.Router();

// Import the controller function
const { sendContactMessage } = require("../controllers/contactController");

// Define the POST route for /contact
// When a POST request is made to this route, it will execute the sendContactMessage function
router.post("/", sendContactMessage);

// Export the router to be used in the main index.js file
module.exports = router;
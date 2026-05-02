const express = require("express");
const router = express.Router();

// Import the new controller function
const { handleVolunteerApplication } = require("../controllers/volunteerController");

// When a POST request is made to /volunteer, run the controller logic
router.post("/", handleVolunteerApplication);

module.exports = router;
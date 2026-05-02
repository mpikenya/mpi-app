const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object using Brevo's SMTP details
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false, 
  auth: {
    user: process.env.BREVO_USER, // Your Brevo login email from .env
    pass: process.env.BREVO_KEY,   // Your Brevo SMTP key from .env
  },
});

// Verify the connection to the SMTP server
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer config error:", error);
  } else {
    console.log("Nodemailer is configured and ready to send emails.");
  }
});

module.exports = transporter;
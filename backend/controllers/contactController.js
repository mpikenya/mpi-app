const transporter = require("../config/nodemailer");

// This function handles sending emails to BOTH the organization and the user
const sendContactMessage = async (req, res) => {
  // Destructure name, email, and message from the request body
  const { name, email, message } = req.body;

  // --- Input Validation (now includes email) ---
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message fields are required." });
  }

  // --- Email #1: Notification to Your Organization ---
  // This email is sent to you.
  const mailToOrganization = {
    from: `"MPI App Contact Form" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: "mathare4peace@gmail.com", // Your organization's email
    subject: `New Message from ${name}`,
    replyTo: email, // This makes it easy to reply directly to the user from your inbox
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Contact Form Submission</h2>
        <p>You have received a new message from the Mathare Peace Initiative app.</p>
        <hr>
        <h3>Sender Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
        </ul>
        <h3>Message:</h3>
        <p style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
          ${message}
        </p>
      </div>
    `,
  };

  // --- Email #2: "Thank You" Confirmation to the User ---
  // This email is sent to the person who filled out the form.
  const mailToUser = {
    from: `"Mathare Peace Initiative" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: email, // The user's email address from the form
    subject: "Thank You for Contacting Us!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>We've Received Your Message!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to Mathare Peace Initiative. We have received your message and a member of our team will get back to you as soon as possible.</p>
        <br>
        <p>Peace and blessings,</p>
        <p><strong>The MPI Kenya Team</strong></p>
        <hr>
        <p style="font-size: 0.8em; color: #777;">
          This is an automated response. For urgent matters, please contact us directly.
        </p>
      </div>
    `,
  };


  // --- Send Both Emails ---
  try {
    // 1. Send the notification email to your organization
    await transporter.sendMail(mailToOrganization);
    console.log(`Notification email sent to organization regarding message from ${name}`);

    // 2. Send the confirmation email to the user
    await transporter.sendMail(mailToUser);
    console.log(`Confirmation email sent to ${email}`);

    // 3. Send a success response back to the frontend app
    res.status(200).json({ message: "Message sent successfully! A confirmation has been sent to your email." });

  } catch (error) {
    console.error("Error sending emails:", error);
    // If something goes wrong, send a 500 Internal Server Error response
    res.status(500).json({ error: "An error occurred while trying to send the message." });
  }
};

// Export the function for use in your routes file
module.exports = {
  sendContactMessage,
};
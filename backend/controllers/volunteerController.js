const transporter = require("../config/nodemailer");

const handleVolunteerApplication = async (req, res) => {
  // Destructure all the fields from the form
  const { fullName, email, phone, reason } = req.body;

  // --- Input Validation ---
  if (!fullName || !email || !phone || !reason) {
    return res.status(400).json({ error: "All fields are required for the application." });
  }

  // --- Email #1: Notification to Your Organization ---
  const mailToOrganization = {
    from: `"MPI Volunteer Application" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: "mathare4peace@gmail.com",
    subject: `New Volunteer Application: ${fullName}`,
    replyTo: email,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Volunteer Application Received</h2>
        <hr>
        <h3>Applicant Details:</h3>
        <ul>
          <li><strong>Full Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>
        <h3>Reason for Volunteering:</h3>
        <p style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
          ${reason}
        </p>
      </div>
    `,
  };

  // --- Email #2: "Thank You" Confirmation to the Applicant ---
  const mailToApplicant = {
    from: `"Mathare Peace Initiative" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: "We've Received Your Volunteer Application!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Thank You for Your Interest, ${fullName}!</h2>
        <p>We have successfully received your volunteer application. Your willingness to contribute to our mission at Mathare Peace Initiative is greatly appreciated.</p>
        <p>Our team will review your application and will be in touch with you soon regarding the next steps.</p>
        <br>
        <p>Peace and blessings,</p>
        <p><strong>The MPI Kenya Team</strong></p>
      </div>
    `,
  };

  try {
    // Send both emails concurrently for better performance
    await Promise.all([
      transporter.sendMail(mailToOrganization),
      transporter.sendMail(mailToApplicant)
    ]);

    console.log(`Volunteer application for ${fullName} processed successfully.`);
    res.status(200).json({ message: "Application submitted successfully!" });

  } catch (error) {
    console.error("Error processing volunteer application:", error);
    res.status(500).json({ error: "An error occurred while submitting your application." });
  }
};

module.exports = {
  handleVolunteerApplication,
};
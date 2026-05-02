const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    // 1. Create a "transporter" - this is the connection to Brevo's server.
    // It reads the host, port, user, and key from your .env file.
    const transporter = nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        auth: {
            user: process.env.BREVO_USER,
            pass: process.env.BREVO_KEY, // 'pass' is the correct property for the key
        },
    });

    // 2. Define the email's content.
    const mailOptions = {
        from: `MPI Kenya <${process.env.BREVO_SENDER_EMAIL}>`, // The "From" address
        to: options.email,       // The recipient's email
        subject: options.subject, // The email subject
        text: options.message,   // The email body

           html: options.html,   
    };

    // 3. Tell the transporter to send the email.
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
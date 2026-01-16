const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use 'gmail' or provide host/port for others
        auth: {
            user: process.env.EMAIL_USER, // Set these in .env
            pass: process.env.EMAIL_PASS  // App Password, not login password
        }
    });

    // 2. Define email options
    const mailOptions = {
        from: `Tutor Platform <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

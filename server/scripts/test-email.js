require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const testEmail = async () => {
    console.log('--- Testing Brevo Email ---');
    console.log('API Key present:', !!process.env.BREVO_API_KEY);
    console.log('From Email:', process.env.EMAIL_FROM);

    // Replace this with your personal email to verify receipt
    const TO_EMAIL = process.env.EMAIL_FROM;

    if (!TO_EMAIL) {
        console.error('Error: EMAIL_FROM is not set in .env');
        return;
    }

    try {
        console.log(`Sending test email to ${TO_EMAIL}...`);
        await sendEmail({
            email: TO_EMAIL,
            subject: 'Test Email from Tutor Platform',
            message: '<h1>Success!</h1><p>Your Brevo configuration is working correctly.</p>'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email failed to send.');
        // The enhanced sendEmail.js will log the details
    }
};

testEmail();

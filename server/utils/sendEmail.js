const { Resend } = require('resend');

const sendEmail = async (options) => {
    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend API (uses HTTPS, works on Render)
    const { data, error } = await resend.emails.send({
        from: `Tutor Platform <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    });

    if (error) {
        console.error('Email send error:', error);
        throw new Error(error.message);
    }

    console.log('Email sent successfully:', data);
    return data;
};

module.exports = sendEmail;

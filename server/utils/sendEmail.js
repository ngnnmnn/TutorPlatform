const SibApiV3Sdk = require('@getbrevo/brevo');

const sendEmail = async (options) => {
    // Initialize Brevo API client
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    );

    // Create email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.message;
    sendSmtpEmail.sender = {
        name: 'Tutor Platform',
        email: process.env.EMAIL_FROM || 'noreply@tutorplatform.com'
    };
    sendSmtpEmail.to = [{ email: options.email }];

    // Send email using Brevo API (uses HTTPS, works on Render)
    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Email send error:', error);
        // Log detailed error from Brevo if available
        if (error.response && error.response.body) {
            console.error('Brevo API Error Body:', JSON.stringify(error.response.body, null, 2));
        }
        throw error;
    }
};

module.exports = sendEmail;

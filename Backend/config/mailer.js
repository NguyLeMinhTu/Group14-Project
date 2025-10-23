const nodemailer = require('nodemailer');
require('dotenv').config();

// Uses Gmail SMTP. For production consider using a dedicated transactional email service.
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS; // app password or oauth token

if (!GMAIL_USER || !GMAIL_PASS) {
    console.warn('Mailer not fully configured: GMAIL_USER or GMAIL_PASS is missing. Forgot password emails will fail.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
});

module.exports = transporter;

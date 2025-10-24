const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '7d';
// Reset token lifetime used for email link (human readable)
const RESET_EXPIRES_IN = '1h';
// Reset token expiry in ms
const RESET_EXPIRES_MS = 60 * 60 * 1000; // 1 hour

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.cookie('token', token, { httpOnly: true });
        res.status(201).json({ message: 'User created', token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.cookie('token', token, { httpOnly: true });
        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

// Demo: generate reset token and send by email using nodemailer (Gmail SMTP)
const mailer = require('../config/mailer');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'email required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email not found' });

        // Generate secure random token (raw token sent to user, hashed stored)
        const resetTokenRaw = crypto.randomBytes(32).toString('hex');
        const resetTokenHashed = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');

        // Set hashed token and expiry on user
        user.resetPasswordToken = resetTokenHashed;
        user.resetPasswordExpires = Date.now() + RESET_EXPIRES_MS;
        await user.save({ validateBeforeSave: false });

        // Build reset URL (frontend should accept token from path or query)
        const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password/${resetTokenRaw}`;

        // Send email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Password reset request',
            text: `You requested a password reset. Use this link to reset your password (valid for ${RESET_EXPIRES_IN}): ${resetUrl}`,
            html: `<p>You requested a password reset. Click the link below to reset your password (valid for ${RESET_EXPIRES_IN}):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        };

        mailer.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Forgot password email error:', err && err.message);
                // Always respond with a generic message — do NOT return the raw token.
                return res.json({ message: 'If the email exists, a reset link has been sent to the registered email address.' });
            }
            console.log('Forgot password email sent:', info && info.response);
            return res.json({ message: 'If the email exists, a reset link has been sent to the registered email address.' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
    try {
        // support token in body or in URL param
        const token = (req.body && req.body.token) || (req.params && req.params.token);
        const { password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'token and new password required' });

        // Hash provided token and look up user with matching hashed token and non-expired
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Password too short (min 6 chars)' });
        user.password = await bcrypt.hash(password, 10);
        // Clear reset fields
        user.resetPasswordToken = '';
        user.resetPasswordExpires = null;
        user.updatedAt = Date.now();
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

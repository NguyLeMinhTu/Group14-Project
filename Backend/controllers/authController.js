const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../middleware/logger');
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

        const hash = bcrypt.hashSync(password, 10);
        const user = new User({ name, email, password: hash });
        await user.save();

        const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // create refresh token and save
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refresh_dev_secret', { expiresIn: `${process.env.REFRESH_EXPIRES_DAYS || 7}d` });
        const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000));
        await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

        // set httpOnly cookies. For local development we allow sameSite lax and secure=false.
        const cookieOptions = { httpOnly: true, sameSite: 'lax' };
        // If FRONTEND_ORIGIN explicitly set and contains a host, we could set cookie domain.
        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
        res.cookie('token', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);
        // For local/dev testing we may return the refresh token in the response body so clients
        // that cannot use cookies (or when SameSite prevents sending cookies) can still refresh.
        const resp = { message: 'User created', token: accessToken };
        if (process.env.NODE_ENV !== 'production') resp.refreshToken = refreshToken;
        res.status(201).json(resp);
    } catch (err) {
        console.error('signup error', err);
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'email and password required' });

        // Log login attempt (anonymous)
        logActivity({ type: 'login_attempt', message: 'Login attempt', req, meta: { email } });

        const user = await User.findOne({ email });
        if (!user) {
            // Log failed attempt (user not found)
            try { await logActivity({ userId: null, type: 'login_failed', message: 'Login failed - user not found', req, meta: { email } }); } catch (e) { }
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const ok = bcrypt.compareSync(password, user.password);
        if (!ok) {
            // Log failed attempt (wrong password)
            try { await logActivity({ userId: user._id, type: 'login_failed', message: 'Login failed - wrong password', req, meta: { email } }); } catch (e) { }
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // issue access + refresh tokens
        const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refresh_dev_secret', { expiresIn: `${process.env.REFRESH_EXPIRES_DAYS || 7}d` });
        const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000));

        // persist refresh token (allow multiple devices)
        await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

        // send cookies (httpOnly, sameSite lax for dev)
        const cookieOptions2 = { httpOnly: true, sameSite: 'lax' };
        if (process.env.NODE_ENV === 'production') cookieOptions2.secure = true;
        res.cookie('token', accessToken, cookieOptions2);
        res.cookie('refreshToken', refreshToken, cookieOptions2);

        // Log successful login
        try { await logActivity({ userId: user._id, type: 'login_success', message: 'User logged in', req }); } catch (e) { }

        const out = { message: 'Login successful', token: accessToken };
        if (process.env.NODE_ENV !== 'production') out.refreshToken = refreshToken;
        return res.json(out);
    } catch (err) {
        console.error('login error', err);
        res.status(500).json({ message: err.message });
    }
};

exports.logout = (req, res) => {
    try {
        // clear cookies
        const refreshToken = req.cookies && req.cookies.refreshToken;
        if (refreshToken) {
            // remove from DB
            RefreshToken.deleteOne({ token: refreshToken }).catch(() => { });
        }
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('refresh error', err);
        res.status(500).json({ message: err.message });
    }
};

// POST /auth/refresh
// Accepts refresh token from cookie, body or Authorization header and returns a new access token.
exports.refresh = async (req, res) => {
    try {
        // Debug logging: show incoming tokens and cookies to help trace refresh calls
        try {
            console.log('[auth] POST /auth/refresh called - cookies:', req.cookies, 'body:', req.body, 'authHeader:', req.headers && req.headers.authorization);
        } catch (e) { }
        let token = null;
        if (req.cookies && req.cookies.refreshToken) token = req.cookies.refreshToken;
        if (!token && req.body && req.body.refreshToken) token = req.body.refreshToken;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) return res.status(401).json({ message: 'No refresh token provided' });

        // check DB
        const stored = await RefreshToken.findOne({ token });
        if (!stored) return res.status(401).json({ message: 'Refresh token not found' });
        if (stored.expiresAt && stored.expiresAt < new Date()) {
            // expired - remove
            await RefreshToken.deleteOne({ token });
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.REFRESH_SECRET || 'refresh_dev_secret');
        } catch (err) {
            // invalid refresh token - remove from DB
            await RefreshToken.deleteOne({ token }).catch(() => { });
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findById(payload.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // issue new access token
        const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Optionally rotate refresh token: here we keep the same refresh token until expiry.

        const cookieOptions3 = { httpOnly: true, sameSite: 'lax' };
        if (process.env.NODE_ENV === 'production') cookieOptions3.secure = true;
        res.cookie('token', accessToken, cookieOptions3);
        res.json({ message: 'Token refreshed', token: accessToken });
    } catch (err) {
        console.error('forgotPassword error', err);
        res.status(500).json({ message: err.message });
    }
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
        console.error('resetPassword error', err);
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
        user.password = bcrypt.hashSync(password, 10);
        // Clear reset fields
        user.resetPasswordToken = '';
        user.resetPasswordExpires = null;
        user.updatedAt = Date.now();
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('checkPermission error', err);
        res.status(500).json({ message: err.message });
    }
};

// Check if authenticated user has a named permission
// Accepts JSON body { permission: string, targetId?: string } or query params
exports.checkPermission = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Support permission from body, query, or header (X-Permission)
        const permission = (req.body && req.body.permission) || req.query.permission || req.get('x-permission') || req.get('permission');
        const targetId = (req.body && req.body.targetId) || req.query.targetId;
        if (!permission) return res.status(400).json({ message: 'permission is required' });

        // Small permission map. Values may be a string (minimum role),
        // or an object { required: string, allowSelf: boolean }
        const permissions = {
            'user:read': 'user',
            // users may update themselves; moderators and above may update any user
            'user:update': { required: 'user', allowSelf: true, escalate: 'moderator' },
            'user:delete': 'admin',
            'post:create': 'user',
            'post:moderate': 'moderator'
        };

        // If permission missing, return available permissions for convenience
        if (!permission) {
            return res.status(400).json({ message: 'permission is required', availablePermissions: Object.keys(permissions) });
        }

        const roleHierarchy = ['user', 'moderator', 'admin'];

        const permEntry = permissions[permission];
        if (!permEntry) return res.status(400).json({ message: 'Unknown permission' });

        const userRole = req.user.role;

        // handle object entry
        let required = null;
        let allowSelf = false;
        let escalate = null;
        if (typeof permEntry === 'string') {
            required = permEntry;
        } else if (typeof permEntry === 'object') {
            required = permEntry.required || null;
            allowSelf = !!permEntry.allowSelf;
            escalate = permEntry.escalate || null;
        }

        // allow self if requested and targetId matches
        if (allowSelf && targetId && targetId === req.user.id) {
            return res.json({ permission, allowed: true, reason: 'self' });
        }

        // If escalate role is present and user's role meets escalate, allow
        if (escalate && roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(escalate)) {
            return res.json({ permission, allowed: true, reason: 'escalated role' });
        }

        // Evaluate required role. Support formats like '>=moderator' or plain role name
        if (!required) return res.status(500).json({ message: 'Permission configuration error' });

        // >= operator
        if (typeof required === 'string' && required.startsWith('>=')) {
            const minRole = required.slice(2);
            const minIdx = roleHierarchy.indexOf(minRole);
            const userIdx = roleHierarchy.indexOf(userRole);
            const allowed = minIdx !== -1 && userIdx !== -1 && userIdx >= minIdx;
            return res.json({ permission, allowed, required });
        }

        // plain role name -> treat as minimum role
        if (typeof required === 'string' && roleHierarchy.includes(required)) {
            const minIdx = roleHierarchy.indexOf(required);
            const userIdx = roleHierarchy.indexOf(userRole);
            const allowed = userIdx !== -1 && userIdx >= minIdx;
            return res.json({ permission, allowed, required });
        }

        // fallback: deny
        return res.json({ permission, allowed: false, required });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

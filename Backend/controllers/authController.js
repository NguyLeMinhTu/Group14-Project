const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '7d';
const RESET_EXPIRES_IN = '1h';

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

// Demo: generate reset token and (in production) send by email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email not found' });

        const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: RESET_EXPIRES_IN });
        // TODO: send resetToken via email to user.email (use nodemailer or external service)
        // For demo/testing we return the token in the response. In production, do NOT return token in body.
        res.json({ message: 'Reset token generated (demo)', resetToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'token and new password required' });

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findById(payload.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Password too short (min 6 chars)' });
        user.password = await bcrypt.hash(password, 10);
        user.updatedAt = Date.now();
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
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

const rateLimit = require('express-rate-limit');
const { logActivity } = require('./logger');

// Generic limiter factory
function createLoginLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        handler: async (req, res) => {
            // Log blocked attempt
            try {
                await logActivity({
                    userId: null,
                    type: 'login_rate_limited',
                    message: `Rate limit exceeded for login`,
                    req,
                    meta: { body: { email: req.body && req.body.email } }
                });
            } catch (err) {
                console.error('Failed to log rate limit event', err);
            }
            res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
        }
    });
}

module.exports = { createLoginLimiter };

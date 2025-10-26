const rateLimit = require('express-rate-limit');
const { logActivity } = require('./logger');

// Generic limiter factory
function createLoginLimiter() {
    // In development, disable the login rate limiter by default to avoid blocking testers.
    // To force-enable the limiter in dev set DISABLE_LOGIN_RATE_LIMIT=false.
    // In production, the limiter is enabled by default; set DISABLE_LOGIN_RATE_LIMIT=true to disable it.
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd && process.env.DISABLE_LOGIN_RATE_LIMIT !== 'false') {
        console.log('[rateLimiters] login limiter bypassed in non-production (dev) environment');
        return (req, res, next) => next();
    }
    if (isProd && process.env.DISABLE_LOGIN_RATE_LIMIT === 'true') {
        console.log('[rateLimiters] login limiter disabled via DISABLE_LOGIN_RATE_LIMIT in production');
        return (req, res, next) => next();
    }

    // Default to 50 requests per 5 minutes for easier local testing; env vars can override
    const windowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000; // default 5 minutes
    const max = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 50; // default 50 requests per window

    console.log(`[rateLimiters] login limiter configured: max=${max}, windowMs=${windowMs} (${Math.ceil(windowMs / 1000)}s)`);

    return rateLimit({
        windowMs,
        max,
        // allow skipping per-request (useful for dev or explicit bypass header)
        skip: (req) => {
            const headerBypass = req.get && req.get('x-bypass-rate-limit') === 'true';
            const skipForEnv = process.env.NODE_ENV !== 'production' || process.env.DISABLE_LOGIN_RATE_LIMIT === 'true';
            const shouldSkip = headerBypass || skipForEnv;
            if (shouldSkip) {
                try { console.log('[rateLimiters] skipping rate limit for request', req.ip || req.connection && req.connection.remoteAddress); } catch (e) { }
            }
            return shouldSkip;
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: async (req, res) => {
            console.warn('[rateLimiters] login rate limit hit for', req.ip || req.connection && req.connection.remoteAddress);
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
            // Include Retry-After header (seconds) as guidance
            try {
                res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
            } catch (e) { }
            res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
        }
    });
}

module.exports = { createLoginLimiter };

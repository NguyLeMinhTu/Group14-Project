const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { createLoginLimiter } = require('../middleware/rateLimiters');

const loginLimiter = createLoginLimiter();
const authMiddleware = require('../middleware/auth');

router.post('/signup', auth.signup);
// Debug wrapper: log incoming login requests when in dev or when DEBUG_LOGIN_REQUESTS=true
router.post(
    '/login',
    loginLimiter,
    (req, res, next) => {
        try {
            const shouldLog = process.env.DEBUG_LOGIN_REQUESTS === 'true' || process.env.NODE_ENV !== 'production';
            if (shouldLog) {
                // Avoid logging very large bodies in production; this is meant for local debugging
                console.log('[debug] POST /auth/login', { ip: req.ip, headers: req.headers, body: req.body });
            }
        } catch (e) {
            /* ignore logging errors */
        }
        next();
    },
    auth.login
);
router.post('/logout', auth.logout);
router.post('/refresh', auth.refresh);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
// Check whether current authenticated user has a permission
router.post('/check-permission', authMiddleware, auth.checkPermission);
// also allow GET for quick checks via query string
router.get('/check-permission', authMiddleware, auth.checkPermission);

module.exports = router;

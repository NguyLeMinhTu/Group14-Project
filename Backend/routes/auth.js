const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { createLoginLimiter } = require('../middleware/rateLimiters');

const loginLimiter = createLoginLimiter();

router.post('/signup', auth.signup);
router.post('/login', loginLimiter, auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

module.exports = router;

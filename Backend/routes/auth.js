const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/refresh', auth.refresh);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
// Check whether current authenticated user has a permission
router.post('/check-permission', authMiddleware, auth.checkPermission);
// also allow GET for quick checks via query string
router.get('/check-permission', authMiddleware, auth.checkPermission);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
// Support reset with token in body (existing) or token in URL param
router.post('/reset-password/:token', auth.resetPassword);

module.exports = router;

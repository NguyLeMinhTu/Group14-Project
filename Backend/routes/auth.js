const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', auth.forgotPassword);
// Only support token via URL param. Require users to use the link sent by email.
router.post('/reset-password/:token', auth.resetPassword);

module.exports = router;

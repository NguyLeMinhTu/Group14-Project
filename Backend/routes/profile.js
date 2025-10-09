const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/userController');

router.get('/', auth, controller.getProfile);
router.put('/', auth, controller.updateProfile);

module.exports = router;

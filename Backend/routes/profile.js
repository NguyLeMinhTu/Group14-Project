const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, controller.getProfile);
router.put('/', auth, controller.updateProfile);
// Accept multipart/form-data with field 'avatar'
router.post('/upload-avatar', auth, upload.single('avatar'), controller.uploadAvatarFile);

module.exports = router;

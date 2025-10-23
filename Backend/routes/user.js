const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const multer = require('multer');

// Use memory storage so we can process the file with Sharp before upload
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Admin-only: list users
router.get('/', auth, requireRole('admin'), controller.getUsers);
// Public: create user (signup)
router.post('/', controller.createUser);
// Admin-only: update any user
router.put('/:id', auth, requireRole('admin'), controller.updateUser); // PUT
// Delete: admin or self (controller will check)
router.delete('/:id', auth, controller.deleteUser); // DELETE

// Upload avatar (authenticated). Field name: 'avatar'
router.post('/avatar', auth, upload.single('avatar'), controller.uploadAvatarFile);

module.exports = router;

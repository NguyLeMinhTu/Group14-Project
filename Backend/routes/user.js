const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Admin-only: list users
router.get('/', auth, requireRole('admin'), controller.getUsers);
// Public: create user (signup)
router.post('/', controller.createUser);
// Admin-only: update any user
router.put('/:id', auth, requireRole('admin'), controller.updateUser); // PUT
// Delete: admin or self (controller will check)
router.delete('/:id', auth, controller.deleteUser); // DELETE

module.exports = router;

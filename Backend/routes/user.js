const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');
const { requireRole, checkRole } = require('../middleware/role');

// Admin+Moderator: list users (moderator and above)
router.get('/', auth, checkRole('>=moderator'), controller.getUsers);
// Public: create user (signup)
router.post('/', controller.createUser);
// Update user: allow moderators+admins to hit this (controller restricts fields). allowSelf true to let users update themselves.
router.put('/:id', auth, checkRole(['>=moderator'], { allowSelf: true }), controller.updateUser); // PUT
// Delete: admin or self (controller will check)
router.delete('/:id', auth, controller.deleteUser); // DELETE

module.exports = router;

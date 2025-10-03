const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.get('/', controller.getUsers);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser); // PUT
router.delete('/:id', controller.deleteUser); // DELETE

module.exports = router;

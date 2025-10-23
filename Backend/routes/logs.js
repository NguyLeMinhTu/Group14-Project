const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Only admin can query logs
router.get('/', auth, requireRole('admin'), logsController.queryLogs);

module.exports = router;

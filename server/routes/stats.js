const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware, isModeratorOrAdmin } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, isModeratorOrAdmin, statsController.getDashboardStats);

module.exports = router;
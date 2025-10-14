const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', themeController.getAllThemes);
router.get('/:id', themeController.getTheme);

// User routes (authenticated)
router.get('/user/current', authMiddleware, themeController.getUserTheme);
router.post('/user/select', authMiddleware, themeController.setUserTheme);

// Admin only routes
router.post('/', authMiddleware, isAdmin, themeController.createTheme);
router.put('/:id', authMiddleware, isAdmin, themeController.updateTheme);
router.delete('/:id', authMiddleware, isAdmin, themeController.deleteTheme);

module.exports = router;
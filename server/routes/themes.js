const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/default', themeController.getDefaultTheme);

// Authenticated user routes
router.get('/user', authMiddleware, themeController.getUserTheme);
router.post('/user/preference', authMiddleware, themeController.setUserTheme);

// Admin routes
router.get('/', authMiddleware, isAdmin, themeController.getAllThemes);
router.post('/', authMiddleware, isAdmin, themeController.createTheme);
router.put('/:id', authMiddleware, isAdmin, themeController.updateTheme);
router.delete('/:id', authMiddleware, isAdmin, themeController.deleteTheme);

module.exports = router;
const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/default', themeController.getDefaultTheme);
router.get('/', themeController.getAllThemes); // ZMIENIONE - teraz publiczne

// Authenticated user routes
router.get('/user', authMiddleware, themeController.getUserTheme);
router.post('/user/preference', authMiddleware, themeController.setUserTheme);

// Admin routes (tworzenie/edycja/usuwanie motywów)
router.post('/', authMiddleware, isAdmin, themeController.createTheme);
router.put('/:id', authMiddleware, isAdmin, themeController.updateTheme);
router.delete('/:id', authMiddleware, isAdmin, themeController.deleteTheme);

module.exports = router;
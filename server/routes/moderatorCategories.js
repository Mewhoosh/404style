const express = require('express');
const router = express.Router();
const moderatorCategoryController = require('../controllers/moderatorCategoryController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Admin only
router.get('/', authMiddleware, isAdmin, moderatorCategoryController.getAll);
router.post('/', authMiddleware, isAdmin, moderatorCategoryController.assignModeratorToCategory);
router.delete('/:id', authMiddleware, isAdmin, moderatorCategoryController.removeModeratorFromCategory);

// Moderator can see their own categories
router.get('/my-categories', authMiddleware, moderatorCategoryController.getModeratorCategories);

module.exports = router;
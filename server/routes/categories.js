const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/breadcrumbs', categoryController.getCategoryBreadcrumbs);

// Admin only routes
router.post('/', authMiddleware, isAdmin, categoryController.createCategory);
router.put('/:id', authMiddleware, isAdmin, categoryController.updateCategory);
router.delete('/:id', authMiddleware, isAdmin, categoryController.deleteCategory);

module.exports = router;
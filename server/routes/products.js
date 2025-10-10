const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, isAdmin, isModeratorOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Moderator/Admin routes
router.get('/moderator/my-products', authMiddleware, isModeratorOrAdmin, productController.getModeratorProducts);
router.post('/', authMiddleware, isModeratorOrAdmin, upload.array('images', 5), productController.createProduct);
router.put('/:id', authMiddleware, isModeratorOrAdmin, productController.updateProduct);

// Admin only routes
router.delete('/:id', authMiddleware, isAdmin, productController.deleteProduct);

module.exports = router;
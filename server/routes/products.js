const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, isModeratorOrAdmin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductWithDetails); // Zmienione
router.get('/:id/related', productController.getRelatedProducts); // Nowe

// Protected routes (moderator/admin)
router.post('/', authMiddleware, isModeratorOrAdmin, productController.createProduct);
router.put('/:id', authMiddleware, isModeratorOrAdmin, productController.updateProduct);
router.delete('/:id', authMiddleware, isModeratorOrAdmin, productController.deleteProduct);

// Image management
router.delete('/:productId/images/:imageId', authMiddleware, isModeratorOrAdmin, productController.deleteProductImage);
router.put('/:productId/images/:imageId/primary', authMiddleware, isModeratorOrAdmin, productController.setPrimaryImage);

module.exports = router;

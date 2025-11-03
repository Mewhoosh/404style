const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// User routes
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:id', authMiddleware, orderController.getOrder);
router.delete('/:id/cancel', authMiddleware, orderController.cancelOrder);

// Admin/Moderator routes
router.get('/admin/all', authMiddleware, roleAuth(['admin', 'moderator']), orderController.getAllOrders);
router.patch('/:id/status', authMiddleware, roleAuth(['admin', 'moderator']), orderController.updateOrderStatus);
router.post('/:id/payment-success', authMiddleware, orderController.updatePaymentSuccess);

module.exports = router;
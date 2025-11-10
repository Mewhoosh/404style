const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware, isModeratorOrAdmin } = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/optionalAuth');

// Public route with optional auth (to see own pending comments)
router.get('/product/:productId', optionalAuthMiddleware, commentController.getProductComments);

// User routes (require auth)
router.post('/', authMiddleware, commentController.createComment);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.post('/:id/vote', authMiddleware, commentController.voteComment);

// Moderator/Admin routes
router.get('/pending', authMiddleware, isModeratorOrAdmin, commentController.getPendingComments);
router.patch('/:id/moderate', authMiddleware, isModeratorOrAdmin, commentController.moderateComment);

module.exports = router;
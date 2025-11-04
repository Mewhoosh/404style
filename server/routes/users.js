const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

router.get('/', authMiddleware, isAdmin, userController.getAllUsers);
router.patch('/:id/role', authMiddleware, isAdmin, userController.updateUserRole);
router.delete('/:id', authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
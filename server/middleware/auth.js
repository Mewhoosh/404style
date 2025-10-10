const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Basic authentication
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with full info
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Check if user is moderator or admin
const isModeratorOrAdmin = (req, res, next) => {
  if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Moderator or Admin only.' });
  }
  next();
};

// Check if moderator has access to specific category
const checkCategoryAccess = (categoryId) => {
  return (req, res, next) => {
    // Admin has access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Moderator - check assigned categories
    if (req.user.role === 'moderator') {
      const assignedCategories = req.user.assignedCategories || [];
      
      if (!assignedCategories.includes(parseInt(categoryId))) {
        return res.status(403).json({ 
          message: 'Access denied. You are not assigned to this category.' 
        });
      }
      
      return next();
    }

    return res.status(403).json({ message: 'Access denied.' });
  };
};

module.exports = {
  authMiddleware,
  isAdmin,
  isModeratorOrAdmin,
  checkCategoryAccess
};
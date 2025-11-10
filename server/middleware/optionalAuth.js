const jwt = require('jsonwebtoken');

exports.optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // No token - continue as guest
      req.userId = null;
      req.userRole = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user to fetch role
      const { User } = require('../models');
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'role']
      });
      
      if (user) {
        req.userId = user.id;
        req.userRole = user.role;
      } else {
        req.userId = null;
        req.userRole = null;
      }
    } catch (error) {
      // Invalid token - continue as guest
      req.userId = null;
      req.userRole = null;
    }
    
    next();
  } catch (error) {
    next();
  }
};
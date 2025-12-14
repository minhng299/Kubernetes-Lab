const jwt = require('jsonwebtoken');
const db = require('../models');
require('dotenv').config();

module.exports = function(allowedRoles = []) {
  return async function(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get fresh user data from database
      const user = await db.User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'resetPasswordToken'] }
      });
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid token or inactive user.' });
      }
      
      req.user = user;
      
      // Check role permissions
      if (allowedRoles.length > 0) {
        const userRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!userRoles.includes(user.role)) {
          return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
      }
      
      next();
    } catch (err) {
      res.status(400).json({ message: 'Invalid token.' });
    }
  };
};

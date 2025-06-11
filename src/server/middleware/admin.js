/**
  * Admin Authorization Middleware
 * 
 * Verifies that the user is an admin
 */

const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // User should already be authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is admin
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Server error in admin authorization' });
  }
};
 
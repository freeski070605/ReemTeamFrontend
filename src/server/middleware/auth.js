/**
  * Authentication Middleware
 * 
 * Verifies JWT tokens for protected routes
 */

const jwt = require('jsonwebtoken');

// Environment variables (would be properly set in production)
const JWT_SECRET = process.env.JWT_SECRET || 'reem-team-secret-key';

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
 
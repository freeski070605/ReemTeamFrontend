/**
  * Authentication Controller
 * 
 * Handles user registration, login, and account management
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Environment variables (would be properly set in production)
const JWT_SECRET = process.env.JWT_SECRET || 'reem-team-secret-key';
const JWT_EXPIRY = '24h';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists' 
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    // Return user data and token (excluding password)
    res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      balance: newUser.balance,
      avatar: newUser.avatar,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    // Return user data and token
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error getting profile' });
  }
};

// Update user balance
exports.updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Amount must be a number' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update balance
    user.balance += amount;
    
    // Ensure balance doesn't go negative
    if (user.balance < 0) {
      user.balance = 0;
    }
    
    await user.save();
    
    res.json({
      id: user._id,
      username: user.username,
      balance: user.balance
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Server error updating balance' });
  }
};
 
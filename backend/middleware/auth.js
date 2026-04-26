const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

// Check active subscription
const requireSubscription = (req, res, next) => {
  if (req.user && req.user.subscription?.status === 'active') return next();
  res.status(403).json({ message: 'Active subscription required' });
};

module.exports = { protect, adminOnly, requireSubscription };

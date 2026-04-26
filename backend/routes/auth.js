const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill in all fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, country });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('selectedCharity', 'name');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        selectedCharity: user.selectedCharity,
        charityPercentage: user.charityPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/auth/me — get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('selectedCharity', 'name image');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

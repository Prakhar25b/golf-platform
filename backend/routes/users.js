const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const { protect } = require('../middleware/auth');

// @GET /api/users/dashboard — full dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('selectedCharity', 'name image');

    const scores = await Score.getLatestFive(req.user._id);

    // Get wins
    const winningDraws = await Draw.find({
      status: 'published',
      'winners.user': req.user._id
    }).sort({ year: -1, month: -1 }).limit(5);

    let totalWon = 0;
    const myWins = [];
    winningDraws.forEach(draw => {
      draw.winners.forEach(w => {
        if (w.user.toString() === req.user._id.toString()) {
          totalWon += w.prizeAmount || 0;
          myWins.push({
            drawMonth: draw.month,
            drawYear: draw.year,
            matchType: w.matchType,
            prizeAmount: w.prizeAmount,
            paymentStatus: w.paymentStatus
          });
        }
      });
    });

    res.json({ user, scores, totalWon, wins: myWins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/users/profile — update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, country, handicap, charityPercentage } = req.body;

    if (charityPercentage && (charityPercentage < 10 || charityPercentage > 100))
      return res.status(400).json({ message: 'Charity percentage must be 10–100%' });

    const updates = {};
    if (name) updates.name = name;
    if (country) updates.country = country;
    if (handicap !== undefined) updates.handicap = handicap;
    if (charityPercentage) updates.charityPercentage = charityPercentage;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password')
      .populate('selectedCharity', 'name');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

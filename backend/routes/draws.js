const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const Score = require('../models/Score');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: check how many numbers from user scores match winning numbers
const countMatches = (userScores, winningNumbers) => {
  const userNums = userScores.map(s => s.score);
  return winningNumbers.filter(n => userNums.includes(n));
};

// @GET /api/draws — get published draws
router.get('/', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12);
    res.json(draws);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/draws/my-results — user's draw results
router.get('/my-results', protect, async (req, res) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.user': req.user._id
    }).sort({ year: -1, month: -1 });

    const myResults = draws.map(draw => {
      const myWins = draw.winners.filter(w => w.user.toString() === req.user._id.toString());
      return { draw: { month: draw.month, year: draw.year, winningNumbers: draw.winningNumbers }, wins: myWins };
    });

    res.json(myResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/draws/latest — latest published draw
router.get('/latest', async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .populate('winners.user', 'name country');
    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/draws/:id/upload-proof — winner uploads proof
router.post('/:id/upload-proof', protect, async (req, res) => {
  try {
    const { proofUrl } = req.body;
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winnerEntry = draw.winners.find(w => w.user.toString() === req.user._id.toString());
    if (!winnerEntry) return res.status(403).json({ message: 'You are not a winner in this draw' });

    winnerEntry.proofUpload = proofUrl;
    winnerEntry.paymentStatus = 'verified'; // pending admin review
    await draw.save();

    res.json({ message: 'Proof uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

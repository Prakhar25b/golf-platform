const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { protect, requireSubscription } = require('../middleware/auth');

// @GET /api/scores — get my scores (latest 5)
router.get('/', protect, requireSubscription, async (req, res) => {
  try {
    const scores = await Score.getLatestFive(req.user._id);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/scores — add new score
router.post('/', protect, requireSubscription, async (req, res) => {
  try {
    const { score, date, course, notes } = req.body;

    if (!score || !date) return res.status(400).json({ message: 'Score and date are required' });
    if (score < 1 || score > 45) return res.status(400).json({ message: 'Score must be between 1 and 45 (Stableford)' });

    // Normalize date to midnight
    const scoreDate = new Date(date);
    scoreDate.setHours(0, 0, 0, 0);

    const newScore = await Score.addScore(req.user._id, {
      score: Number(score),
      date: scoreDate,
      course,
      notes
    });

    res.status(201).json(newScore);
  } catch (error) {
    if (error.message.includes('already exists')) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/scores/:id — edit a score
router.put('/:id', protect, requireSubscription, async (req, res) => {
  try {
    const { score, course, notes } = req.body;
    const existing = await Score.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Score not found' });

    if (score && (score < 1 || score > 45))
      return res.status(400).json({ message: 'Score must be between 1 and 45' });

    existing.score = score ?? existing.score;
    existing.course = course ?? existing.course;
    existing.notes = notes ?? existing.notes;
    await existing.save();

    res.json(existing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/scores/:id — delete a score
router.delete('/:id', protect, requireSubscription, async (req, res) => {
  try {
    const score = await Score.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

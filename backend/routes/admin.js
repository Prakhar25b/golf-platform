const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ─── USER MANAGEMENT ──────────────────────────────────────────────
// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (status) query['subscription.status'] = status;

    const users = await User.find(query)
      .select('-password')
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/admin/users/:id — edit user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, 'subscription.status': subStatus } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (subStatus) updates['subscription.status'] = subStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/admin/users/:id/scores — view user scores
router.get('/users/:id/scores', async (req, res) => {
  try {
    const scores = await Score.find({ user: req.params.id }).sort({ date: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── CHARITY MANAGEMENT ──────────────────────────────────────────────
// @POST /api/admin/charities — add charity
router.post('/charities', async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/admin/charities/:id — update charity
router.put('/charities/:id', async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/admin/charities/:id — delete charity
router.delete('/charities/:id', async (req, res) => {
  try {
    await Charity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── DRAW MANAGEMENT ──────────────────────────────────────────────
// @POST /api/admin/draws/run — run a draw
router.post('/draws/run', async (req, res) => {
  try {
    const { month, year, drawType = 'random', publish = false } = req.body;

    // Check if draw already exists
    let draw = await Draw.findOne({ month, year });
    if (draw && draw.status === 'published')
      return res.status(400).json({ message: 'Draw already published for this month' });

    // Get all active subscribers
    const activeUsers = await User.find({ 'subscription.status': 'active' });
    const totalSubscribers = activeUsers.length;

    // Calculate prize pool (e.g., £10/month per subscriber)
    const subscriptionFee = 10;
    const totalPool = totalSubscribers * subscriptionFee;

    // Get previous jackpot if any
    const prevDraw = await Draw.findOne({ month: month - 1 > 0 ? month - 1 : 12, year: month - 1 > 0 ? year : year - 1 });
    let rolledOver = 0;
    if (prevDraw && !prevDraw.winners.find(w => w.matchType === '5-match')) {
      rolledOver = prevDraw.prizePool.fiveMatch;
    }

    // Generate winning numbers (5 numbers, 1-45)
    let winningNumbers = [];
    if (drawType === 'random') {
      while (winningNumbers.length < 5) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!winningNumbers.includes(n)) winningNumbers.push(n);
      }
    } else {
      // Algorithmic: use most frequent user scores
      const allScores = await Score.find({ user: { $in: activeUsers.map(u => u._id) } });
      const freq = {};
      allScores.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1; });
      winningNumbers = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([score]) => Number(score));
    }

    // Check all users for matches
    const winners = [];
    for (const user of activeUsers) {
      const userScores = await Score.find({ user: user._id });
      const userNums = userScores.map(s => s.score);
      const matched = winningNumbers.filter(n => userNums.includes(n));

      if (matched.length >= 3) {
        let matchType = matched.length === 5 ? '5-match' : matched.length === 4 ? '4-match' : '3-match';
        winners.push({ user: user._id, matchType, matchedNumbers: matched });
      }
    }

    // Calculate prizes
    const prizePool = {
      total: totalPool + rolledOver,
      fiveMatch: Math.floor((totalPool * 0.40) + rolledOver),
      fourMatch: Math.floor(totalPool * 0.35),
      threeMatch: Math.floor(totalPool * 0.25),
      jackpotRolledOver: rolledOver
    };

    const fiveMatchWinners = winners.filter(w => w.matchType === '5-match');
    const fourMatchWinners = winners.filter(w => w.matchType === '4-match');
    const threeMatchWinners = winners.filter(w => w.matchType === '3-match');

    winners.forEach(w => {
      if (w.matchType === '5-match')
        w.prizeAmount = fiveMatchWinners.length ? Math.floor(prizePool.fiveMatch / fiveMatchWinners.length) : 0;
      else if (w.matchType === '4-match')
        w.prizeAmount = fourMatchWinners.length ? Math.floor(prizePool.fourMatch / fourMatchWinners.length) : 0;
      else
        w.prizeAmount = threeMatchWinners.length ? Math.floor(prizePool.threeMatch / threeMatchWinners.length) : 0;
    });

    // Rollover jackpot if no 5-match winner
    if (fiveMatchWinners.length === 0) prizePool.fiveMatch = prizePool.fiveMatch; // kept for next month

    if (draw) {
      draw.winningNumbers = winningNumbers;
      draw.winners = winners;
      draw.prizePool = prizePool;
      draw.activeSubscribers = totalSubscribers;
      draw.drawType = drawType;
      if (publish) { draw.status = 'published'; draw.publishedAt = new Date(); }
      else draw.status = 'simulated';
      await draw.save();
    } else {
      draw = await Draw.create({
        month, year, drawType, winningNumbers, winners, prizePool,
        activeSubscribers: totalSubscribers,
        status: publish ? 'published' : 'simulated',
        publishedAt: publish ? new Date() : undefined
      });
    }

    res.json({ draw, message: publish ? 'Draw published!' : 'Simulation complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/admin/draws/:id/publish — publish a simulated draw
router.put('/draws/:id/publish', async (req, res) => {
  try {
    const draw = await Draw.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/admin/draws — all draws
router.get('/draws', async (req, res) => {
  try {
    const draws = await Draw.find().sort({ year: -1, month: -1 });
    res.json(draws);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── WINNERS MANAGEMENT ──────────────────────────────────────────────
// @GET /api/admin/winners — all winners
router.get('/winners', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published', 'winners.0': { $exists: true } })
      .populate('winners.user', 'name email')
      .sort({ year: -1, month: -1 });

    const allWinners = [];
    draws.forEach(draw => {
      draw.winners.forEach(w => {
        allWinners.push({
          drawId: draw._id,
          month: draw.month,
          year: draw.year,
          user: w.user,
          matchType: w.matchType,
          prizeAmount: w.prizeAmount,
          paymentStatus: w.paymentStatus,
          proofUpload: w.proofUpload,
          winnerId: w._id
        });
      });
    });
    res.json(allWinners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/admin/winners/:drawId/:winnerId — update winner payout status
router.put('/winners/:drawId/:winnerId', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ message: 'Winner not found' });

    winner.paymentStatus = paymentStatus;
    if (paymentStatus === 'verified') winner.verifiedAt = new Date();
    await draw.save();

    res.json({ message: 'Winner status updated', winner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ANALYTICS ──────────────────────────────────────────────
// @GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscribers = await User.countDocuments({ 'subscription.status': 'active' });
    const monthlySubscribers = await User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'monthly' });
    const yearlySubscribers = await User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'yearly' });
    const totalDraws = await Draw.countDocuments({ status: 'published' });
    const totalCharities = await Charity.countDocuments({ active: true });

    const subscriptionFee = 10;
    const estimatedPool = activeSubscribers * subscriptionFee;

    res.json({
      totalUsers,
      activeSubscribers,
      monthlySubscribers,
      yearlySubscribers,
      totalDraws,
      totalCharities,
      estimatedMonthlyPool: estimatedPool
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── SEED DATA ──────────────────────────────────────────────
// @POST /api/admin/seed — seed sample charities
router.post('/seed', async (req, res) => {
  try {
    const count = await Charity.countDocuments();
    if (count > 0) return res.json({ message: 'Data already seeded' });

    await Charity.insertMany([
      { name: 'Golf for Good', description: 'Using golf to support underprivileged youth communities through sport and mentorship.', shortDescription: 'Golf for youth empowerment', category: 'sports', featured: true },
      { name: 'Green Fairways Foundation', description: 'Environmental conservation through sustainable golf course management and reforestation.', shortDescription: 'Eco-friendly golf initiative', category: 'environment', featured: true },
      { name: 'Swing & Smile', description: 'Therapeutic golf programs for children and adults with disabilities.', shortDescription: 'Golf therapy programs', category: 'health', featured: true },
      { name: 'Community Links', description: 'Building community centres in underserved areas through charity golf events.', shortDescription: 'Community development', category: 'community', featured: false },
    ]);

    res.json({ message: 'Charities seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

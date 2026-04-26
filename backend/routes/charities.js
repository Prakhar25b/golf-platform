const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/charities — list all active charities (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { active: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const charities = await Charity.find(query).sort({ featured: -1, name: 1 });
    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/charities/featured — featured charities for homepage
router.get('/featured', async (req, res) => {
  try {
    const charities = await Charity.find({ featured: true, active: true }).limit(3);
    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/charities/:id — single charity profile
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/charities/select — user selects a charity
router.put('/select', protect, async (req, res) => {
  try {
    const { charityId, percentage } = req.body;

    if (!charityId) return res.status(400).json({ message: 'Charity ID required' });

    const charity = await Charity.findById(charityId);
    if (!charity || !charity.active) return res.status(404).json({ message: 'Charity not found' });

    if (percentage && (percentage < 10 || percentage > 100))
      return res.status(400).json({ message: 'Charity percentage must be between 10% and 100%' });

    await User.findByIdAndUpdate(req.user._id, {
      selectedCharity: charityId,
      charityPercentage: percentage || 10
    });

    res.json({ message: 'Charity selection updated', charity, percentage: percentage || 10 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

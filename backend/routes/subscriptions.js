const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// NOTE: In production, integrate Stripe here.
// For demo/learning purposes, this uses a simplified mock flow.

// @POST /api/subscriptions/subscribe — mock subscribe
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!['monthly', 'yearly'].includes(plan))
      return res.status(400).json({ message: 'Plan must be monthly or yearly' });

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1);
    else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    await User.findByIdAndUpdate(req.user._id, {
      subscription: {
        status: 'active',
        plan,
        startDate: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: `mock_cus_${Date.now()}`,
        stripeSubscriptionId: `mock_sub_${Date.now()}`
      }
    });

    res.json({ message: `Successfully subscribed to ${plan} plan`, plan, currentPeriodEnd: periodEnd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/subscriptions/cancel — cancel subscription
router.post('/cancel', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled'
    });
    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/subscriptions/status — check subscription status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

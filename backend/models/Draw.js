const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true },  // 1-12
  year: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },
  drawType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
  
  // The winning numbers (user scores 1-45)
  winningNumbers: [{ type: Number, min: 1, max: 45 }],

  // Prize pool info
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },  // 40%
    fourMatch: { type: Number, default: 0 },  // 35%
    threeMatch: { type: Number, default: 0 }, // 25%
    jackpotRolledOver: { type: Number, default: 0 } // carried from previous month
  },

  // Winners
  winners: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchType: { type: String, enum: ['5-match', '4-match', '3-match'] },
    matchedNumbers: [Number],
    prizeAmount: Number,
    paymentStatus: { type: String, enum: ['pending', 'verified', 'paid', 'rejected'], default: 'pending' },
    proofUpload: String,
    verifiedAt: Date
  }],

  // Subscriber snapshot at time of draw
  activeSubscribers: { type: Number, default: 0 },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Unique draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);

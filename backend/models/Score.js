const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 45 }, // Stableford format
  date: { type: Date, required: true },
  course: { type: String, trim: true },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index: one score per user per date
scoreSchema.index({ user: 1, date: 1 }, { unique: true });

// Static method: get latest 5 scores for a user (most recent first)
scoreSchema.statics.getLatestFive = function(userId) {
  return this.find({ user: userId })
    .sort({ date: -1 })
    .limit(5);
};

// Static method: add new score (auto-removes oldest if already 5)
scoreSchema.statics.addScore = async function(userId, scoreData) {
  const existing = await this.findOne({ user: userId, date: scoreData.date });
  if (existing) throw new Error('A score already exists for this date');

  const count = await this.countDocuments({ user: userId });
  
  if (count >= 5) {
    // Find and delete the oldest score
    const oldest = await this.findOne({ user: userId }).sort({ date: 1 });
    await this.findByIdAndDelete(oldest._id);
  }

  return this.create({ user: userId, ...scoreData });
};

module.exports = mongoose.model('Score', scoreSchema);

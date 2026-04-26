const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Subscription info
  subscription: {
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'lapsed'], default: 'inactive' },
    plan: { type: String, enum: ['monthly', 'yearly'] },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    startDate: Date
  },

  // Charity selection
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  charityPercentage: { type: Number, default: 10, min: 10, max: 100 }, // min 10%

  // Profile
  avatar: String,
  country: String,
  handicap: Number,
  
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

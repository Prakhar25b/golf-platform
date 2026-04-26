const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  image: { type: String },
  website: { type: String },
  category: { type: String, enum: ['health', 'education', 'environment', 'sports', 'community', 'other'], default: 'other' },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  
  // Events (e.g. golf days)
  events: [{
    title: String,
    date: Date,
    location: String,
    description: String
  }],

  // Tracking
  totalReceived: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Charity', charitySchema);

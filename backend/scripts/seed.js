/**
 * Seed Script — run with: node scripts/seed.js
 * Creates admin user + sample charities for demo purposes
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Charity = require('../models/Charity');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/golf-platform';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminExists = await User.findOne({ email: 'admin@golfgive.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin User', email: 'admin@golfgive.com', password: 'admin123', role: 'admin', subscription: { status: 'active', plan: 'yearly' } });
    console.log('Admin created: admin@golfgive.com / admin123');
  }

  const userExists = await User.findOne({ email: 'user@golfgive.com' });
  if (!userExists) {
    await User.create({ name: 'John Golfer', email: 'user@golfgive.com', password: 'user123', subscription: { status: 'active', plan: 'monthly' } });
    console.log('Demo user created: user@golfgive.com / user123');
  }

  const count = await Charity.countDocuments();
  if (count === 0) {
    await Charity.insertMany([
      { name: 'Golf for Good', description: 'Using golf to support underprivileged youth communities through sport and mentorship programs.', shortDescription: 'Golf for youth empowerment', category: 'sports', featured: true },
      { name: 'Green Fairways Foundation', description: 'Environmental conservation through sustainable golf course management and reforestation initiatives.', shortDescription: 'Eco-friendly golf initiative', category: 'environment', featured: true },
      { name: 'Swing & Smile', description: 'Therapeutic golf programs for children and adults with disabilities.', shortDescription: 'Golf therapy programs', category: 'health', featured: true },
      { name: 'Community Links', description: 'Building community centres in underserved areas.', shortDescription: 'Community development', category: 'community', featured: false },
    ]);
    console.log('Sample charities seeded');
  }

  console.log('Seed complete!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });

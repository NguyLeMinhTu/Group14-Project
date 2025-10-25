const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/user');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/group14';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    // Remove existing users in this demo seed (CAUTION in real environments)
    await User.deleteMany({});

    const users = [
      { name: 'Regular User', email: 'user@example.com', password: 'password123', role: 'user' },
      { name: 'Moderator User', email: 'moderator@example.com', password: 'moderator123', role: 'moderator' },
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' }
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      const user = new User({ name: u.name, email: u.email, password: hash, role: u.role });
      await user.save();
      console.log('Created:', u.email, 'role:', u.role);
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

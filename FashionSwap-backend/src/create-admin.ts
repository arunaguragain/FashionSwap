import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionswap';

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const email = 'admin@fashionswap.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Admin@123456!', salt);

    const admin = new User({
      email,
      password,
      firstName: 'System',
      lastName: 'Admin',
      location: 'Kathmandu',
      role: 'admin',
      isVerified: true
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@fashionswap.com');
    console.log('Password: Admin@123456!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

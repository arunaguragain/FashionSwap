import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model';
import Listing from './models/listing.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionswap';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear existing data (optional, but good for fresh seeding)
    // Uncomment these if you want to wipe before seeding:
    // await User.deleteMany({ email: { $in: ['seller1@fashionswap.com', 'seller2@fashionswap.com'] } });
    // await Listing.deleteMany({});

    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Password123!', salt);

    const seller1 = new User({
      email: 'sita.sharma@fashionswap.com',
      password: password,
      firstName: 'Sita',
      lastName: 'Sharma',
      location: 'Baneshwor, Kathmandu',
      phone: '9841000001',
      role: 'user',
      isVerified: true
    });

    const seller2 = new User({
      email: 'ram.shrestha@fashionswap.com',
      password: password,
      firstName: 'Ram',
      lastName: 'Shrestha',
      location: 'Patan, Lalitpur',
      phone: '9851000002',
      role: 'user',
      isVerified: true
    });

    await seller1.save();
    await seller2.save();
    console.log('Users created!');

    console.log('Creating listings...');
    const listings = [
      {
        title: 'Authentic Dhaka Kurta',
        description: 'Beautiful traditional Dhaka Kurta. Worn only once for a festival. Great condition and vibrant colors.',
        category: 'Tops',
        brand: 'Local Boutique',
        size: 'M',
        color: 'Red/Multicolor',
        condition: 'Like New',
        material: 'Cotton Dhaka',
        askingPrice: 1500,
        negotiable: true,
        images: ['https://images.unsplash.com/photo-1591557302488-8422634f19b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        sellerId: seller1._id,
        sellerName: 'Sita Sharma',
        location: seller1.location,
        status: 'available'
      },
      {
        title: 'Goldstar Classic Sneakers',
        description: 'Authentic Goldstar shoes, classic model. Very comfortable for walking around Thamel.',
        category: 'Shoes',
        brand: 'Goldstar',
        size: '40',
        color: 'Black/White',
        condition: 'Good',
        material: 'Canvas',
        askingPrice: 600,
        negotiable: false,
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        sellerId: seller2._id,
        sellerName: 'Ram Shrestha',
        location: seller2.location,
        status: 'available'
      },
      {
        title: 'Pashmina Shawl',
        description: 'Pure Pashmina shawl bought from Asan. Very warm and soft. Perfect for Kathmandu winters.',
        category: 'Accessories',
        brand: 'Handmade',
        size: 'One Size',
        color: 'Maroon',
        condition: 'New',
        material: 'Pashmina',
        askingPrice: 3500,
        negotiable: true,
        images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        sellerId: seller1._id,
        sellerName: 'Sita Sharma',
        location: seller1.location,
        status: 'available'
      },
      {
        title: 'North Face Down Jacket (Replica)',
        description: 'High-quality replica North Face jacket. Extremely warm, suitable for trekking. Gently used.',
        category: 'Outerwear',
        brand: 'North Face (Replica)',
        size: 'L',
        color: 'Blue',
        condition: 'Good',
        material: 'Polyester/Down',
        askingPrice: 2000,
        negotiable: true,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        sellerId: seller2._id,
        sellerName: 'Ram Shrestha',
        location: seller2.location,
        status: 'available'
      }
    ];

    await Listing.insertMany(listings);
    console.log('Listings created!');
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

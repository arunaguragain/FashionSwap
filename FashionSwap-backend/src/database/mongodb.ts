import mongoose from 'mongoose';
import { MONGODB_URI } from '../config';

export async function connectDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected for FashionSwap');
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); 
    }
}

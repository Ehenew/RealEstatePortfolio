import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/realestate_portfolio';
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;


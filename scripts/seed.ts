/*
  Seed script: creates an admin user and a sample property/content if they don't exist.
*/
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/database';
import User from '../src/models/user.model';
import Property from '../src/models/property.model';
import Content from '../src/models/content.model';

dotenv.config();

(async (): Promise<void> => {
  try {
    await connectDB();

    // Ensure admin user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPwd,
        role: 'admin'
      });
      console.log('Created admin user:', adminEmail);
    } else {
      console.log('Admin user exists:', adminEmail);
    }

    // Sample property
    let anyProperty = await Property.findOne();
    if (!anyProperty) {
      anyProperty = await Property.create({
        title: 'Luxury Modern Villa in Bole',
        price: '3,200,000 ETB',
        location: 'Bole, Addis Ababa',
        type: 'villa',
        featured: true,
        status: 'active',
        description: 'Beautiful modern villa with premium finishes',
        yearBuilt: '2022',
        parking: '2 cars',
        amenities: ['wifi', 'parking', 'garden', 'pool'],
        agent: admin._id
      });
      console.log('Created sample property');
    } else {
      console.log('Property already exists');
    }

    // Sample content
    let anyContent = await Content.findOne();
    if (!anyContent) {
      anyContent = await Content.create({
        title: 'Top 5 Areas to Buy Property in Addis Ababa 2024',
        platform: 'youtube',
        duration: '8:45',
        url: 'https://youtube.com/watch?v=123',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'market-insights',
        tags: ['investment', 'addis-ababa'],
        featured: true,
        agent: admin._id
      });
      console.log('Created sample content');
    } else {
      console.log('Content already exists');
    }

    await mongoose.connection.close();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();


import mongoose, { Schema, Model } from 'mongoose';
import { IProperty } from '../types';

const propertySchema = new Schema<IProperty>({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: String,
    required: [true, 'Price is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['villa', 'apartment', 'townhouse', 'penthouse', 'commercial', 'land']
  },
  bedrooms: {
    type: String
  },
  bathrooms: {
    type: String
  },
  size: {
    type: String
  },
  yearBuilt: {
    type: String
  },
  parking: {
    type: String
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'garden', 'gym', 'pool', 'security', 'air-conditioning', 'balcony', 'furnished']
  }],
  images: [{
    url: String,
    filename: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'pending'],
    default: 'active'
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  metaTitle: String,
  metaDescription: String
}, {
  timestamps: true
});

// Create slug before saving
propertySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Index for better search performance
propertySchema.index({ title: 'text', description: 'text', location: 'text' });
propertySchema.index({ status: 1, featured: -1 });
propertySchema.index({ type: 1, price: 1 });

const Property: Model<IProperty> = mongoose.model<IProperty>('Property', propertySchema);

export default Property;


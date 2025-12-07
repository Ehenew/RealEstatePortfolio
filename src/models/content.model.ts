import mongoose, { Schema, Model } from 'mongoose';
import { IContent } from '../types';

const contentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['youtube', 'tiktok', 'facebook', 'instagram', 'telegram']
  },
  duration: {
    type: String
  },
  url: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please enter a valid URL']
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
    enum: ['market-insights', 'investment-tips', 'neighborhood-guides', 'home-buying', 'property-tours', 'client-testimonials']
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  scheduled: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

contentSchema.index({ platform: 1, featured: -1 });
contentSchema.index({ category: 1, scheduled: -1 });

const Content: Model<IContent> = mongoose.model<IContent>('Content', contentSchema);

export default Content;


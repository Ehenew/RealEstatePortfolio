const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
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
    required: [true, 'URL is required'],
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please enter a valid URL']
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
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

module.exports = mongoose.model('Content', contentSchema);
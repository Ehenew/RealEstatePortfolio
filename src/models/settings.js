const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  office_address: {
    type: String,
    required: [true, 'Office address is required']
  },
  youtube_url: String,
  facebook_url: String,
  instagram_url: String,
  telegram_url: String,
  tiktok_url: String,
  whatsapp_url: String,
  linkedin_url: String,
  about: {
    type: String,
    maxlength: [2000, 'About section cannot exceed 2000 characters']
  },
  services: [String],
  languages: [String],
  experience: {
    type: String
  },
  license: {
    type: String
  }
}, {
  timestamps: true
});

// Only one settings document should exist
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      phone: '+251 918 410 705',
      email: 'mequanintalemu@gmail.com',
      office_address: 'Bole, Addis Ababa, Ethiopia'
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
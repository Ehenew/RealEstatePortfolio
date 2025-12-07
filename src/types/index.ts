import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'agent';
  lastLogin: Date;
  isActive: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProperty extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  price: string;
  location: string;
  type: 'villa' | 'apartment' | 'townhouse' | 'penthouse' | 'commercial' | 'land';
  bedrooms?: string;
  bathrooms?: string;
  size?: string;
  yearBuilt?: string;
  parking?: string;
  amenities: Array<'wifi' | 'parking' | 'garden' | 'gym' | 'pool' | 'security' | 'air-conditioning' | 'balcony' | 'furnished'>;
  images: Array<{
    url: string;
    filename: string;
    isPrimary: boolean;
  }>;
  featured: boolean;
  status: 'active' | 'sold' | 'rented' | 'pending';
  agent: Types.ObjectId | IUser;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContent extends Document {
  _id: Types.ObjectId;
  title: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'telegram';
  duration?: string;
  url?: string;
  thumbnail?: string;
  category?: 'market-insights' | 'investment-tips' | 'neighborhood-guides' | 'home-buying' | 'property-tours' | 'client-testimonials';
  tags: string[];
  featured: boolean;
  scheduled?: Date;
  views: number;
  likes: number;
  agent: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettings extends Document {
  _id: Types.ObjectId;
  phone: string;
  email: string;
  office_address: string;
  youtube_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  telegram_url?: string;
  tiktok_url?: string;
  whatsapp_url?: string;
  linkedin_url?: string;
  about?: string;
  services: string[];
  languages: string[];
  experience?: string;
  license?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Express.Request {
  user?: IUser;
}


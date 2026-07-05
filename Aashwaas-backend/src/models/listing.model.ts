import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Shoes' | 'Bags' | 'Accessories';
  brand: string;
  size: string;
  color: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  material: string;
  careInstructions?: string;
  askingPrice: number; 
  negotiable: boolean;
  images: string[];
  sellerId: mongoose.Types.ObjectId;
  sellerName: string;
  sellerRating?: number;
  status: 'available' | 'sold' | 'removed';
  views: number;
  location: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const listingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'],
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      required: true,
    },
    material: {
      type: String,
      required: true,
      trim: true,
    },
    careInstructions: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    askingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'removed'],
      default: 'available',
    },
    views: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    pickupAvailable: {
      type: Boolean,
      default: true,
    },
    shippingAvailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

listingSchema.index({ sellerId: 1, status: 1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ createdAt: -1 });

export default mongoose.model<IListing>('Listing', listingSchema);



   

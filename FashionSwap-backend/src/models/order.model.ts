import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  offerPrice: number;
  offerMessage?: string;
  status: 'created' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  deliveryMethod: 'cash_on_delivery' | 'meet_at_location';
  meetingLocation?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    offerMessage: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    status: {
      type: String,
      enum: ['created', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'created',
    },
    deliveryMethod: {
      type: String,
      enum: ['cash_on_delivery', 'meet_at_location'],
      default: 'cash_on_delivery',
    },
    meetingLocation: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ listingId: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);

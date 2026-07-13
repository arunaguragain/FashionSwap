import mongoose, { Document, Schema } from 'mongoose';

export type ReviewerRole = 'buyer' | 'seller';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  revieweeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  reviewerRole: ReviewerRole;
  rating: number;
  comment: string;
  itemCondition?: number;
  communicationQuality: number;
  deliverySpeed?: number;
  reliability: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewerRole: {
      type: String,
      enum: ['buyer', 'seller'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    itemCondition: {
      type: Number,
      min: 1,
      max: 5,
    },
    communicationQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    deliverySpeed: {
      type: Number,
      min: 1,
      max: 5,
    },
    reliability: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ orderId: 1 });

export const ReviewModel = mongoose.model<IReview>('Review', reviewSchema);
export default ReviewModel;








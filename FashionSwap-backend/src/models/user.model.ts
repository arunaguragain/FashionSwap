import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ISellerProfile {
  averageRating: number;
  totalRatings: number;
  itemsSold: number;
  responseTimeHours: number;
  verifiedSeller: boolean;
  verifiedAt?: Date;
  returnsAccepted: boolean;
}

interface IBuyerProfile {
  totalPurchases: number;
  averageRating: number;
  totalRatings: number;
  itemsPurchased: number;
  disputes: number;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location: string;
  role: 'user' | 'admin' | 'buyer' | 'seller';
  mfaEnabled: boolean;
  totpSecret?: string;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  sellerProfile?: ISellerProfile;
  buyerProfile?: IBuyerProfile;
  isVerified: boolean;
  verificationOTP?: string;
  verificationOTPExpiry?: Date;
  passwordResetOTP?: string;
  passwordResetOTPExpiry?: Date;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 12,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    totpSecret: {
      type: String,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    sellerProfile: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      itemsSold: {
        type: Number,
        default: 0,
      },
      responseTimeHours: {
        type: Number,
        default: 24,
      },
      verifiedSeller: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      returnsAccepted: {
        type: Boolean,
        default: false,
      },
    },
    buyerProfile: {
      totalPurchases: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      itemsPurchased: {
        type: Number,
        default: 0,
      },
      disputes: {
        type: Number,
        default: 0,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
      default: null,
    },
    verificationOTPExpiry: {
      type: Date,
      default: null,
    },
    passwordResetOTP: {
      type: String,
      default: null,
    },
    passwordResetOTPExpiry: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;





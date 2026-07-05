import { Request, Response } from 'express';
import User from '../models/user.model';
import Review from '../models/review.model';

const getRequestUserId = (req: Request): string => {
  const user = (req as any).user;
  return String(user?._id || user?.id || user?.userId);
};

export class ProfileController {
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('-password -totpSecret -verificationOTP -passwordResetOTP -failedLoginAttempts')
        .lean();

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
  }

  async getSellerStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('sellerProfile').lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'Seller not found' });
        return;
      }

      const reviewCount = await Review.find({ revieweeId: userId, reviewerRole: 'buyer' }).countDocuments();

      res.status(200).json({
        success: true,
        data: {
          ...user.sellerProfile,
          reviewCount,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching seller stats' });
    }
  }

  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);

      const user = await User.findById(userId).select('-password -totpSecret');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
  }

  async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { firstName, lastName, bio, avatar, location, phone } = req.body;

      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (location) updateData.location = location;
      if (phone !== undefined) updateData.phone = phone;

      delete updateData.role;
      delete updateData.password;
      delete updateData.email;

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -totpSecret');

      res.status(200).json({ success: true, message: 'Profile updated', data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  }
}

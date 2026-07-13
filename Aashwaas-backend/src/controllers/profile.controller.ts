import { Request, Response } from 'express';
import User from '../models/user.model';
import Review from '../models/review.model';
import Listing from '../models/listing.model';
import Order from '../models/order.model';

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
      const updateData: Record<string, unknown> = {};

      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (location !== undefined) updateData.location = location;
      if (phone !== undefined) updateData.phone = phone;

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -totpSecret');

      res.status(200).json({ success: true, message: 'Profile updated', data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  }

  /**
   * GET /api/profiles/me/export
   * Returns all of the authenticated user's own data as JSON.
   * Satisfies the CW2 "data export aligned with privacy principles" requirement.
   */
  async exportMyData(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);

      const profile = await User.findById(userId)
        .select('-password -totpSecret -verificationOTP -passwordResetOTP -failedLoginAttempts')
        .lean();

      if (!profile) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const [listings, orders, reviews] = await Promise.all([
        Listing.find({ sellerId: userId }).lean(),
        Order.find({ $or: [{ buyerId: userId }, { sellerId: userId }] }).lean(),
        Review.find({ $or: [{ reviewerId: userId }, { revieweeId: userId }] }).lean(),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile,
        listings,
        orders,
        reviews,
      };

      res.setHeader('Content-Disposition', 'attachment; filename="fashionswap-data-export.json"');
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ success: true, data: exportData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error exporting data' });
    }
  }
}

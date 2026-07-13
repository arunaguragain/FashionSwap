import { Request, Response } from 'express';
import Listing from '../models/listing.model';
import User from '../models/user.model';
import { ListingFilter } from '../types/fashionswap.types';

export class ListingController {
  async getAllListings(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, category, minPrice, maxPrice, condition, sortBy = 'newest' } = req.query;

      const filter: any = { status: 'available' };
      if (category) filter.category = String(category);

      if (minPrice || maxPrice) {
        filter.askingPrice = {};
        if (minPrice) filter.askingPrice.$gte = Number(minPrice);
        if (maxPrice) filter.askingPrice.$lte = Number(maxPrice);
      }

      if (condition) filter.condition = String(condition);

      let sort: any = { createdAt: -1 };
      if (sortBy === 'price_low') sort = { askingPrice: 1 };
      if (sortBy === 'price_high') sort = { askingPrice: -1 };

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const listings = await Listing.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Listing.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: listings,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching listings' });
    }
  }

  async getListingById(req: Request, res: Response): Promise<void> {
    try {
      const { listingId } = req.params;

      const listing = await Listing.findByIdAndUpdate(
        listingId,
        { $inc: { views: 1 } },
        { new: true }
      ).lean();

      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }

      res.status(200).json({ success: true, data: listing });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching listing' });
    }
  }

  async searchListings(req: Request, res: Response): Promise<void> {
    try {
      const { query, category } = req.query;
      const searchFilter: any = { status: 'available' };

      if (query) {
        searchFilter.$or = [
          { title: { $regex: String(query), $options: 'i' } },
          { description: { $regex: String(query), $options: 'i' } },
          { brand: { $regex: String(query), $options: 'i' } },
        ];
      }

      if (category) searchFilter.category = String(category);

      const listings = await Listing.find(searchFilter).limit(50).lean();

      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error searching listings' });
    }
  }

  async createListing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = (req as any).user;
      const {
        title,
        description,
        category,
        brand,
        size,
        color,
        condition,
        material,
        careInstructions,
        askingPrice,
        negotiable,
        images,
        location,
        pickupAvailable,
        shippingAvailable,
      } = req.body;

      const seller = await User.findById(userId);
      if (!seller) {
        res.status(404).json({ success: false, message: 'Seller not found' });
        return;
      }

      const listing = new Listing({
        title,
        description,
        category,
        brand,
        size,
        color,
        condition,
        material,
        careInstructions,
        askingPrice,
        negotiable,
        images,
        location,
        pickupAvailable,
        shippingAvailable,
        sellerId: userId,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        sellerRating: seller.sellerProfile?.averageRating || 0,
        status: 'available',
      });

      await listing.save();

      res.status(201).json({ success: true, message: 'Listing created', data: listing });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error creating listing' });
    }
  }

  async updateListing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = (req as any).user;
      const { listingId } = req.params;
      const allowedFields = [
        'title',
        'description',
        'category',
        'brand',
        'size',
        'color',
        'condition',
        'material',
        'careInstructions',
        'askingPrice',
        'negotiable',
        'images',
        'location',
        'pickupAvailable',
        'shippingAvailable',
      ];
      const updateData: Record<string, unknown> = {};
      Object.entries(req.body || {}).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateData[key] = value;
        }
      });

      const listing = await Listing.findById(listingId);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }

      if (listing.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'You can only update your own listings' });
        return;
      }

      const updatedListing = await Listing.findByIdAndUpdate(listingId, updateData, { new: true });

      res.status(200).json({ success: true, message: 'Listing updated', data: updatedListing });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating listing' });
    }
  }

  async deleteListing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = (req as any).user;
      const { listingId } = req.params;

      const listing = await Listing.findById(listingId);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }

      if (listing.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'You can only delete your own listings' });
        return;
      }

      await Listing.deleteOne({ _id: listingId });

      res.status(200).json({ success: true, message: 'Listing deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting listing' });
    }
  }

  async markAsSold(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = (req as any).user;
      const { listingId } = req.params;

      const listing = await Listing.findById(listingId);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }

      if (listing.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Only seller can mark as sold' });
        return;
      }

      listing.status = 'sold';
      await listing.save();

      res.status(200).json({ success: true, message: 'Listing marked as sold', data: listing });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error marking listing as sold' });
    }
  }

  async getMyListings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = (req as any).user;
      const { status = 'available' } = req.query;

      const filter: any = { sellerId: userId };
      if (status) filter.status = String(status);

      const listings = await Listing.find(filter).sort({ createdAt: -1 }).lean();

      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching your listings' });
    }
  }
}

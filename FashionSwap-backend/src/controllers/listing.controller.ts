import { Request, Response } from 'express';
import Listing from '../models/listing.model';
import User from '../models/user.model';
import { ListingFilter } from '../types/fashionswap.types';
import { recordAuditEvent } from '../services/audit.service';

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
      const user = (req as any).user;
      const userId = String(user._id || user.id);
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
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'LISTING_CREATED', meta: { listingId: listing._id?.toString(), title } });

      res.status(201).json({ success: true, message: 'Listing created', data: listing });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error creating listing' });
    }
  }
//Allow-list pattern preventing mass assignment - only 15 permitted fields can be updated
  async updateListing(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = String(user._id || user.id);
      const { listingId } = req.params;
      const {
        title, description, category, brand, size, color, condition,
        material, careInstructions, askingPrice, negotiable, images,
        location, pickupAvailable, shippingAvailable
      } = req.body;

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (brand !== undefined) updateData.brand = brand;
      if (size !== undefined) updateData.size = size;
      if (color !== undefined) updateData.color = color;
      if (condition !== undefined) updateData.condition = condition;
      if (material !== undefined) updateData.material = material;
      if (careInstructions !== undefined) updateData.careInstructions = careInstructions;
      if (askingPrice !== undefined) updateData.askingPrice = askingPrice;
      if (negotiable !== undefined) updateData.negotiable = negotiable;
      if (images !== undefined) updateData.images = images;
      if (location !== undefined) updateData.location = location;
      if (pickupAvailable !== undefined) updateData.pickupAvailable = pickupAvailable;
      if (shippingAvailable !== undefined) updateData.shippingAvailable = shippingAvailable;

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
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'LISTING_UPDATED', meta: { listingId } });

      res.status(200).json({ success: true, message: 'Listing updated', data: updatedListing });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating listing' });
    }
  }

  async deleteListing(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = String(user._id || user.id);
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
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'LISTING_DELETED', meta: { listingId } });

      res.status(200).json({ success: true, message: 'Listing deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting listing' });
    }
  }

  async markAsSold(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = String(user._id || user.id);
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
      const user = (req as any).user;
      const userId = String(user._id || user.id);
      const { status } = req.query;

      const filter: any = { sellerId: userId };
      
      if (status && status !== 'all') {
        filter.status = String(status);
      } else {
        // If status='all' or no status is provided, fetch all listings except removed ones
        filter.status = { $ne: 'removed' };
      }

      const listings = await Listing.find(filter).sort({ createdAt: -1 }).lean();

      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching your listings' });
    }
  }
}

import { Request, Response } from "express";
import Listing from "../../models/listing.model";
import { recordAuditEvent } from "../../services/audit.service";

export class AdminListingController {
  async getAllListingsAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, q } = req.query;
      const filter: any = {};
      
      if (q) {
        filter.$or = [
          { title: { $regex: String(q), $options: "i" } },
          { category: { $regex: String(q), $options: "i" } },
          { brand: { $regex: String(q), $options: "i" } },
        ];
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const listings = await Listing.find(filter)
        .populate("sellerId", "firstName lastName email avatar")
        .sort({ createdAt: -1 })
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
      res.status(500).json({ success: false, message: "Error fetching listings" });
    }
  }

  async deleteListingAdmin(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = String(user._id || user.id);
      const { id } = req.params;

      const listing = await Listing.findById(id);
      if (!listing) {
        res.status(404).json({ success: false, message: "Listing not found" });
        return;
      }

      await Listing.deleteOne({ _id: id });
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: "ADMIN_LISTING_DELETED", meta: { listingId: id } });

      res.status(200).json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting listing" });
    }
  }
}

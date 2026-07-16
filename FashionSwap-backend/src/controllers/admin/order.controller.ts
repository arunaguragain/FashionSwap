import { Request, Response } from "express";
import Order from "../../models/order.model";
import { recordAuditEvent } from "../../services/audit.service";

export class AdminOrderController {
  async getAllOrdersAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, q } = req.query;
      const filter: any = {};
      
      // Simple search by status or order ID if q is provided, though ID search would need valid ObjectId cast ideally.
      if (q) {
        filter.status = { $regex: String(q), $options: "i" };
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const orders = await Order.find(filter)
        .populate("listingId", "title askingPrice images")
        .populate("buyerId", "firstName lastName email avatar")
        .populate("sellerId", "firstName lastName email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Order.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching orders" });
    }
  }

  async deleteOrderAdmin(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = String(user._id || user.id);
      const { id } = req.params;

      const order = await Order.findById(id);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      await Order.deleteOne({ _id: id });
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: "ADMIN_ORDER_DELETED", meta: { orderId: id } });

      res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting order" });
    }
  }
}

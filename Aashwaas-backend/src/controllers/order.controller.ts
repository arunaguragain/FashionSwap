import { Request, Response } from 'express';
import Order from '../models/order.model';
import Listing from '../models/listing.model';
import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import { recordAuditEvent } from '../services/audit.service';

const getRequestUserId = (req: Request): string => {
  const user = (req as any).user;
  return String(user?._id || user?.id || user?.userId);
};

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { listingId, offerPrice, offerMessage, deliveryMethod, meetingLocation } = req.body;

      const listing = await Listing.findById(listingId);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }

      if (listing.status !== 'available') {
        res.status(400).json({ success: false, message: 'Listing is no longer available' });
        return;
      }

      if (listing.sellerId.toString() === userId) {
        res.status(400).json({ success: false, message: 'You cannot purchase your own listing' });
        return;
      }

      const order = new Order({
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        offerPrice,
        offerMessage,
        deliveryMethod,
        meetingLocation,
      });

      await order.save();

      const transaction = new Transaction({
        orderId: order._id,
        buyerId: userId,
        sellerId: listing.sellerId,
      });

      await transaction.save();

      res.status(201).json({ success: true, message: 'Order created', data: order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error creating order' });
    }
  }

  async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { view = 'all' } = req.query;

      let filter: any = {};
      if (view === 'buying') {
        filter.buyerId = userId;
      } else if (view === 'selling') {
        filter.sellerId = userId;
      } else {
        filter.$or = [{ buyerId: userId }, { sellerId: userId }];
      }

      const orders = await Order.find(filter)
        .populate('listingId', 'title images askingPrice')
        .populate('buyerId', 'firstName lastName avatar')
        .populate('sellerId', 'firstName lastName avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching orders' });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { orderId } = req.params;

      const order = await Order.findById(orderId)
        .populate('listingId')
        .populate('buyerId', '-password')
        .populate('sellerId', '-password');

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      if (order.buyerId.toString() !== userId && order.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'You do not have access to this order' });
        return;
      }

      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching order' });
    }
  }

  async acceptOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { orderId } = req.params;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      if (order.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Only seller can accept order' });
        return;
      }

      if (order.status !== 'created') {
        res.status(400).json({ success: false, message: 'Order cannot be accepted in current status' });
        return;
      }

      order.status = 'accepted';
      order.acceptedAt = new Date();
      await order.save();
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'ORDER_ACCEPTED', meta: { orderId } });

      res.status(200).json({ success: true, message: 'Order accepted', data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error accepting order' });
    }
  }

  async declineOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { orderId } = req.params;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      if (order.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Only seller can decline order' });
        return;
      }

      if (order.status !== 'created') {
        res.status(400).json({ success: false, message: 'Order cannot be declined in current status' });
        return;
      }

      order.status = 'declined';
      await order.save();
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'ORDER_DECLINED', meta: { orderId } });

      res.status(200).json({ success: true, message: 'Order declined', data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error declining order' });
    }
  }

  async completeOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { orderId } = req.params;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      if (order.buyerId.toString() !== userId && order.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'You do not have access to this order' });
        return;
      }

      if (order.status !== 'accepted') {
        res.status(400).json({ success: false, message: 'Order must be accepted before marking complete' });
        return;
      }

      order.status = 'completed';
      order.completedAt = new Date();
      await order.save();

      await User.updateOne({ _id: order.sellerId }, { $inc: { 'sellerProfile.itemsSold': 1 } });
      await User.updateOne({ _id: order.buyerId }, { $inc: { 'buyerProfile.itemsPurchased': 1 } });
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'ORDER_COMPLETED', meta: { orderId } });

      res.status(200).json({ success: true, message: 'Order completed', data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error completing order' });
    }
  }
}

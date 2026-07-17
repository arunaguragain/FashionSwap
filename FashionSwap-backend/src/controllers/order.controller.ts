import { Request, Response } from 'express';
import Order from '../models/order.model';
import Listing from '../models/listing.model';
import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import { recordAuditEvent } from '../services/audit.service';
import { sendOrderPlacedEmail, sendOrderApprovedEmail } from '../utils/email';

const getRequestUserId = (req: Request): string => {
  const user = (req as any).user;
  return String(user?._id || user?.id || user?.userId);
};

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { listingId, price, deliveryAddress, deliveryMethod, meetingLocation } = req.body;

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
        price,
        deliveryAddress,
        deliveryMethod,
        meetingLocation,
      });

      await order.save();

      listing.status = 'pending';
      await listing.save();

      const transaction = new Transaction({
        orderId: order._id,
        buyerId: userId,
        sellerId: listing.sellerId,
      });

      await transaction.save();

      // Fetch seller email and send notification
      const seller = await User.findById(listing.sellerId);
      console.log('📦 Order created for listing:', listing.title);
      console.log('👤 Seller info:', { email: seller?.email, id: listing.sellerId });
      if (seller?.email) {
        await sendOrderPlacedEmail(seller.email, {
          listingTitle: listing.title,
          price,
          deliveryMethod,
          deliveryAddress,
        });
      } else {
        console.log('⚠️ Seller email not found');
      }

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
        .populate('buyerId', 'firstName lastName avatar email phone')
        .populate('sellerId', 'firstName lastName avatar email phone')
        .sort({ createdAt: -1 })
        .lean();

      const orderIds = orders.map((o) => o._id);
      const transactions = await Transaction.find({ orderId: { $in: orderIds } }).lean();

      const ordersWithTransactions = orders.map((order) => {
        const transaction = transactions.find((t) => String(t.orderId) === String(order._id));
        return {
          ...order,
          transaction: transaction || null,
        };
      });

      res.status(200).json({ success: true, data: ordersWithTransactions });
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

  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { orderId } = req.params;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      if (order.buyerId.toString() !== userId && order.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Only buyer or seller can cancel order' });
        return;
      }

      if (order.status === 'accepted' || order.status === 'completed') {
        res.status(400).json({ success: false, message: 'Order cannot be cancelled once accepted' });
        return;
      }

      order.status = 'cancelled';
      await order.save();

      const listing = await Listing.findById(order.listingId);
      if (listing) {
        listing.status = 'available';
        await listing.save();
      }
      recordAuditEvent({ timestamp: new Date().toISOString(), userId, event: 'ORDER_CANCELLED', meta: { orderId } });

      res.status(200).json({ success: true, message: 'Order cancelled', data: order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error cancelling order' });
    }
  }

  async acceptOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { orderId } = req.params;

      const order = await Order.findById(orderId).populate('listingId');
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

      const listingId = (order.listingId as any)?._id || order.listingId;
      const listing = await Listing.findById(listingId);
      if (listing) {
        console.log('🏷️ Updating listing status from', listing.status, 'to sold');
        listing.status = 'sold';
        await listing.save();
        console.log('✅ Listing marked as sold:', listing.title);
      }

      const buyer = await User.findById(order.buyerId);
      const listingTitle = (listing?.title || (order.listingId as any)?.title || 'your listing');
      console.log('✅ Order accepted for listing:', listingTitle);
      console.log('👤 Buyer info:', { email: buyer?.email, id: order.buyerId });
      if (buyer?.email) {
        await sendOrderApprovedEmail(buyer.email, {
          listingTitle,
          price: order.price,
          deliveryMethod: order.deliveryMethod,
          deliveryAddress: order.deliveryAddress,
        });
      } else {
        console.log('⚠️ Buyer email not found');
      }

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

      const listing = await Listing.findById(order.listingId);
      if (listing) {
        listing.status = 'available';
        await listing.save();
      }
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

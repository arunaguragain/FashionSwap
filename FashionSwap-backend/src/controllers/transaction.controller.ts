import { Request, Response } from 'express';
import Transaction from '../models/transaction.model';

const getRequestUserId = (req: Request): string => {
  const user = (req as any).user;
  return String(user?._id || user?.id || user?.userId);
};

export class TransactionController {
  async getTransactionByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const transaction = await Transaction.findOne({ orderId }).populate('orderId');
      if (!transaction) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching transaction' });
    }
  }

  async confirmDelivery(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { transactionId } = req.params;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      if (transaction.buyerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Only buyer can confirm delivery' });
        return;
      }

      transaction.buyerConfirmed = true;
      if (transaction.sellerConfirmed) {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
      }

      await transaction.save();

      if (transaction.status === 'completed') {
        const Order = require('../models/order.model').default;
        const User = require('../models/user.model').default;
        const order = await Order.findById(transaction.orderId);
        if (order) {
            order.status = 'completed';
            order.completedAt = new Date();
            await order.save();
            await User.updateOne({ _id: order.sellerId }, { $inc: { 'sellerProfile.itemsSold': 1 } });
            await User.updateOne({ _id: order.buyerId }, { $inc: { 'buyerProfile.itemsPurchased': 1 } });
        }
      }

      res.status(200).json({ success: true, message: 'Delivery confirmed', data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error confirming delivery' });
    }
  }

  async confirmHandover(req: Request, res: Response): Promise<void> {
    try {
      const userId = getRequestUserId(req);
      const { transactionId } = req.params;
      const { handoverProofImages } = req.body;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      if (transaction.sellerId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'Only seller can confirm handover' });
        return;
      }

      transaction.sellerConfirmed = true;
      if (handoverProofImages) {
        transaction.handoverProofImages = handoverProofImages;
      }

      if (transaction.buyerConfirmed) {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
      }

      await transaction.save();

      if (transaction.status === 'completed') {
        const Order = require('../models/order.model').default;
        const User = require('../models/user.model').default;
        const order = await Order.findById(transaction.orderId);
        if (order) {
            order.status = 'completed';
            order.completedAt = new Date();
            await order.save();
            await User.updateOne({ _id: order.sellerId }, { $inc: { 'sellerProfile.itemsSold': 1 } });
            await User.updateOne({ _id: order.buyerId }, { $inc: { 'buyerProfile.itemsPurchased': 1 } });
        }
      }

      res.status(200).json({ success: true, message: 'Handover confirmed', data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error confirming handover' });
    }
  }
}

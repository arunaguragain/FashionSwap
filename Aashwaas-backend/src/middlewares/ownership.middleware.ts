import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import Listing from '../models/listing.model';
import Order from '../models/order.model';
import Transaction from '../models/transaction.model';

const getRequestUserId = (req: Request) => {
  const user = req.user as any;
  return String(user?._id || user?.id || user?.userId);
};

export const requireListingOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getRequestUserId(req);
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new HttpError(404, 'Listing not found');
    }

    if (listing.sellerId.toString() !== userId) {
      throw new HttpError(403, 'Forbidden: only the listing owner can perform this action');
    }

    next();
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Forbidden' });
  }
};

export const requireOrderParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getRequestUserId(req);
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new HttpError(404, 'Order not found');
    }

    if (order.buyerId.toString() !== userId && order.sellerId.toString() !== userId) {
      throw new HttpError(403, 'Forbidden: only the buyer or seller can access this order');
    }

    next();
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Forbidden' });
  }
};

export const requireTransactionParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getRequestUserId(req);
    const { transactionId, orderId } = req.params;

    const transaction = transactionId
      ? await Transaction.findById(transactionId)
      : orderId
      ? await Transaction.findOne({ orderId })
      : null;

    if (!transaction) {
      throw new HttpError(404, 'Transaction not found');
    }

    if (transaction.buyerId.toString() !== userId && transaction.sellerId.toString() !== userId) {
      throw new HttpError(403, 'Forbidden: only buyer or seller can access this transaction');
    }

    next();
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Forbidden' });
  }
};

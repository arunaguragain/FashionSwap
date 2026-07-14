import { Request } from 'express';
import mongoose from 'mongoose';

export const getRequestUserId = (req: Request): string => {
  const user = req.user as any;
  return String(user?._id || user?.id || user?.userId);
};

export const isValidObjectId = (id?: string): boolean => {
  return !!id && mongoose.Types.ObjectId.isValid(id);
};

export const isOwner = (resourceOwnerId: string, userId: string): boolean => {
  return resourceOwnerId.toString() === userId;
};

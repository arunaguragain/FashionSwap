import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user) {
        throw new HttpError(401, 'Unauthorized: missing user credentials');
      }

      if (!allowedRoles.includes(user.role)) {
        throw new HttpError(403, 'Forbidden: insufficient role');
      }

      next();
    } catch (error: any) {
      return res.status(error.statusCode || 403).json({ success: false, message: error.message });
    }
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireSeller = requireRole(['seller', 'admin']);
export const requireBuyer = requireRole(['buyer', 'admin']);
export const requireVerifiedSeller = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    if (!user) {
      throw new HttpError(401, 'Unauthorized: missing user credentials');
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
      throw new HttpError(403, 'Forbidden: seller role required');
    }

    if (user.role === 'seller' && !user.sellerProfile?.verifiedSeller) {
      throw new HttpError(403, 'Forbidden: seller must be verified');
    }

    next();
  } catch (error: any) {
    return res.status(error.statusCode || 403).json({ success: false, message: error.message });
  }
};

export const logAuthorizationCheck = (message: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.debug(`[RBAC] ${message}`, { userId: req.user?._id, role: req.user?.role });
    next();
  };
};

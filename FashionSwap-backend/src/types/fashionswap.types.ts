// FashionSwap-specific type definitions

export type FashionCategory = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Shoes' | 'Bags' | 'Accessories';
export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
export type ListingStatus = 'available' | 'pending' | 'sold' | 'removed' | 'seller_inactive';
export type OrderStatus = 'created' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type TransactionStatus = 'pending' | 'completed' | 'disputed';
export type UserRole = 'user' | 'admin';
export type DeliveryMethod = 'cash_on_delivery' | 'meet_at_location';

export interface SellerStats {
  averageRating: number;
  totalRatings: number;
  itemsSold: number;
  responseTimeHours: number;
  verifiedSeller: boolean;
}

export interface BuyerStats {
  totalPurchases: number;
  averageRating: number;
  disputes: number;
}

export interface ListingFilter {
  category?: FashionCategory;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  size?: string;
  brand?: string;
  location?: string;
  sellerId?: string;
  status?: ListingStatus;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating';
}

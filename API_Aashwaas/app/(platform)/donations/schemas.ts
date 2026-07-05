export type DonationStatus = "pending" | "approved" | "assigned" | "completed" | "cancelled";
export type DonationCondition = "New" | "Like New" | "Good" | "Fair";
export type DonationCategory = "Clothes" | "Books" | "Electronics" | "Furniture" | "Food" | "Other";

export interface DonationModel {
  _id: string;
  itemName: string;
  category: DonationCategory;
  description?: string;
  quantity: string;
  condition: DonationCondition;
  pickupLocation: string;
  media?: string;
  donorId: string;
  status: DonationStatus;
  ngoId?: string;
}

export interface DonationListParams {
  query?: string;
  category?: string;
  status?: DonationStatus;
  page?: number;
  perPage?: number;
  [key: string]: any;
}

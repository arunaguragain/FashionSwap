export interface ReviewModel {
  _id: string;
  rating: number; // 1-5
  comment?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListParams {
  page?: number;
  perPage?: number; // alias for `size`/`perPage`
  size?: number;
  [key: string]: any;
}

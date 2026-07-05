export type TaskStatus = "assigned" | "accepted" | "rejected" | "completed";

export interface TaskModel {
  _id: string;
  title: string;
  donationId: string;
  volunteerId: string;
  ngoId?: string;
  status: TaskStatus;
  assignedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListParams {
  query?: string;
  status?: TaskStatus;
  volunteerId?: string;
  ngoId?: string;
  page?: number;
  perPage?: number;
  [key: string]: any;
}

export interface TaskCreateParams {
  title: string;
  donationId: string;
  volunteerId: string;
  ngoId?: string;
}

export interface TaskUpdateParams {
  title?: string;
  status?: TaskStatus;
  assignedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
}

// Alias for clarity in API usage
export type VolunteerTask = TaskModel;

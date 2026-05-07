export type UserRole = 'ADMIN' | 'OPERATOR';
export type MaterialStatus = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE' | 'LOST';
export type EventStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ChecklistType = 'DEPARTURE' | 'RETURN';
export type ChecklistItemStatus = 'PENDING' | 'CONFIRMED' | 'MISSING' | 'DAMAGED';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

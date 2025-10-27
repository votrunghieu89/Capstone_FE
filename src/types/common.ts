export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchRequest {
  query?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FilterRequest {
  topicId?: string;
  isPrivate?: boolean;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface StatsData {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
}

export interface MonthlyStats {
  month: string;
  count: number;
}

export interface RoleStats {
  role: string;
  count: number;
  percentage: number;
}

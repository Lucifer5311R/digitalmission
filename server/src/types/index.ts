import { Request } from 'express';
import { UserRole } from '../models/User';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

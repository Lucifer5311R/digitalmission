import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserRole } from '../models/User';
import { AppError } from './errorHandler';

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

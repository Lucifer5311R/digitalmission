import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest } from '../types';
import { AppError } from './errorHandler';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
}

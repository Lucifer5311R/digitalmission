import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../types';

const isDev = env.nodeEnv === 'development';

// Key by authenticated user ID when available, otherwise by IP
const keyGenerator = (req: Request): string => {
  const authReq = req as any;
  return authReq.user?.id || req.ip || 'unknown';
};

export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // No rate limiting in development
  keyGenerator,
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      error: 'Too many requests. Please try again later.',
    };
    res.status(429).json(response);
  },
});

export const loginLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      error: 'Too many login attempts. Please try again later.',
    };
    res.status(429).json(response);
  },
});

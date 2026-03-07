import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiResponse } from '../types';

export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
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
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      error: 'Too many login attempts. Please try again later.',
    };
    res.status(429).json(response);
  },
});

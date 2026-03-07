import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    dialect: 'sqlite' as const,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    // In dev: 1-minute window so rate limit resets quickly. In prod: 15 minutes.
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (process.env.NODE_ENV === 'production' ? '900000' : '60000'), 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'production' ? '200' : '2000'), 10),
    loginMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? '10' : '100'), 10),
  },
};

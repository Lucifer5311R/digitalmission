import winston from 'winston';
import { env } from '../config/env';

const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'attendance-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

if (env.nodeEnv === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  );
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log' }),
  );
}

export default logger;

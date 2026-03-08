import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { corsOptions } from './config/cors';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { env } from './config/env';

const app = express();

// Security
app.use(helmet());
app.use(cors(corsOptions));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../../data/uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Production: serve built frontend and handle SPA routes
if (env.nodeEnv === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Development: return JSON 404 for unknown API routes
  app.use(notFoundHandler);
}

// Error handler (must be last)
app.use(errorHandler);

export default app;

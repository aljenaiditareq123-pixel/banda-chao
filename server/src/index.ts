import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { initializeSocket } from './realtime/socket';
import authRoutes from './api/auth';
import userRoutes from './api/users';
import founderRoutes from './api/founder';
import makerRoutes from './api/makers';
import productRoutes from './api/products';
import videoRoutes from './api/videos';
import postRoutes from './api/posts';
import commentRoutes from './api/comments';
import aiRoutes from './api/ai';
import paymentRoutes from './api/payments';
import analyticsRoutes from './api/analytics';
import orderRoutes from './api/orders';
import notificationRoutes from './api/notifications';
import conversationRoutes from './api/conversations';
import reportRoutes from './api/reports';
import maintenanceRoutes from './api/maintenance';
import opsRoutes from './api/ops';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { prisma } from './utils/prisma';

// Load environment variables
dotenv.config();

// Check environment variables
import { checkBackendEnv } from './utils/env-check';
import { testDatabaseConnection } from './utils/db-connection-test';

checkBackendEnv();

// Test database connection on startup (development only)
if (process.env.NODE_ENV === 'development' || process.env.TEST_DB_ON_START === 'true') {
  testDatabaseConnection()
    .then((result) => {
      if (result.success) {
        console.log('[STARTUP] ✅ Database connection verified');
      } else {
        console.error('[STARTUP] ❌ Database connection failed:', result.error);
        console.error('[STARTUP] Details:', result.details);
      }
    })
    .catch((err) => {
      console.error('[STARTUP] ❌ Database test error:', err);
    });
}

const app: Express = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Socket.IO
initializeSocket(server);

// Security: Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const allowedOrigins = NODE_ENV === 'production'
  ? [
      FRONTEND_URL,
      'https://banda-chao-frontend.onrender.com',
      'https://banda-chao.onrender.com',
    ].filter(Boolean)
  : [
      FRONTEND_URL,
      'http://localhost:3000',
      'https://banda-chao.vercel.app',
      'https://banda-chao-frontend.onrender.com',
      'https://banda-chao.onrender.com',
    ].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
// Stripe webhook needs raw body for signature verification - must be before JSON middleware
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (development only)
app.use(requestLogger);

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Temporary: Store last KPIs error in memory (shared with founder.ts)
// This will be populated by founder.ts when an error occurs
(global as any).lastKPIsError = null;

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Temporary: Public endpoint to view last KPIs error (for debugging)
app.get('/api/debug/last-kpis-error', (req: Request, res: Response) => {
  const lastError = (global as any).lastKPIsError;
  res.json({
    success: true,
    lastError: lastError,
    message: lastError ? 'Last error found' : 'No error recorded yet',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/founder', founderRoutes);
app.use('/api/v1/makers', makerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/ai', aiLimiter, aiRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/ops', opsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 Socket.IO: http://localhost:${PORT}/socket.io`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  
  // Verify Prisma connection (lightweight check)
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Database connection verified`);
  } catch (err) {
    console.warn(`⚠️ Database connection check failed:`, err);
  }
});

// Export app for testing
export default app;


import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
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
import likeRoutes from './api/likes';
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
import speechRoutes from './api/speech';
import betaRoutes from './api/beta';
import adminRoutes from './api/admin';
import serviceRoutes from './api/services';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authenticateToken } from './middleware/auth';
import { csrfProtection, csrfTokenHandler, getCsrfToken } from './middleware/csrf';
import { prisma } from './utils/prisma';

// Load environment variables
dotenv.config();

// Initialize Sentry BEFORE anything else (if available)
import { initSentry } from './utils/sentry';
initSentry();

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

// Trust proxy (required for Render, Vercel, and other hosting platforms)
// Configure trust proxy to only trust the first proxy (Render's load balancer)
// This prevents rate limiting bypass while still working with Render
app.set('trust proxy', 1); // Trust only the first proxy (Render's load balancer)

// Initialize Socket.IO
initializeSocket(server);

// Security: Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
// Support both string patterns and RegExp patterns for dynamic Vercel URLs
const allowedOriginPatterns: (string | RegExp)[] = NODE_ENV === 'production'
  ? [
      // Production URLs (exact matches)
      FRONTEND_URL,
      'https://banda-chao.vercel.app',
      'https://banda-chao-frontend.onrender.com',
      'https://banda-chao.onrender.com',
      // Vercel Preview URLs (dynamic - using regex pattern)
      /^https:\/\/.*\.vercel\.app$/, // Matches all *.vercel.app subdomains
      // Render URLs
      /^https:\/\/.*\.onrender\.com$/, // Matches all *.onrender.com subdomains
    ].filter(Boolean)
  : [
      // Development URLs
      FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:10000',
      'https://banda-chao.vercel.app',
      'https://banda-chao-frontend.onrender.com',
      'https://banda-chao.onrender.com',
      // Vercel Preview URLs (for development/testing)
      /^https:\/\/.*\.vercel\.app$/, // Matches all *.vercel.app subdomains
      // Render URLs
      /^https:\/\/.*\.onrender\.com$/, // Matches all *.onrender.com subdomains
    ].filter(Boolean);

// CORS middleware with full support for OPTIONS requests
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // In development, allow all origins for easier testing
    if (NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CORS] ✅ Development mode - Allowing origin: ${origin}`);
      }
      callback(null, true);
      return;
    }
    
    // In production, check against allowed origin patterns
    const normalizedOrigin = origin.toLowerCase().trim();
    const isAllowed = allowedOriginPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        // Exact string match (case-insensitive)
        return pattern.toLowerCase().trim() === normalizedOrigin;
      } else if (pattern instanceof RegExp) {
        // Regex pattern match
        return pattern.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`[CORS] ❌ Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-CSRF-Token', // CSRF token header (uppercase)
    'x-csrf-token', // CSRF token header (lowercase - explicit for compatibility)
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range',
    'X-CSRF-Token', // Expose CSRF token in response
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight OPTIONS requests explicitly with CORS
app.options('*', cors({
  origin: (origin, callback) => {
    // Allow requests with no origin
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // In development, allow all origins
    if (NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // In production, use the same origin pattern matching logic
    const normalizedOrigin = origin.toLowerCase().trim();
    const isAllowed = allowedOriginPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern.toLowerCase().trim() === normalizedOrigin;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`[CORS] ❌ Blocked OPTIONS request from: ${origin}`);
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

// Cookie parser (must be before CSRF middleware)
app.use(cookieParser());

// Middleware
// Stripe webhook needs raw body for signature verification - must be before JSON middleware
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF Token Handler (for GET requests - generates token)
app.use(csrfTokenHandler);

// CSRF Protection (for state-changing operations)
app.use(csrfProtection);

// Sentry request handler (if available)
try {
  const Sentry = require('@sentry/node');
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
} catch (e) {
  // Sentry not installed - skip
}

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

// CSRF token endpoint (for authenticated users to get fresh token)
app.get('/api/v1/csrf-token', authenticateToken, (req: Request, res: Response) => {
  getCsrfToken(req, res);
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
app.use('/api/v1/likes', likeRoutes);
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
app.use('/api/v1/speech', speechRoutes);
app.use('/api/v1/beta', betaRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/services', serviceRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Sentry error handler (if available)
try {
  const Sentry = require('@sentry/node');
  app.use(Sentry.Handlers.errorHandler());
} catch (e) {
  // Sentry not installed - skip
}

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


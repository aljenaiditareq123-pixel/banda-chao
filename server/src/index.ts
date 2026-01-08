import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  defaultRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  interactionRateLimiter,
  uploadRateLimiter,
  roleBasedRateLimiter,
} from './middleware/rateLimit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
import brainAiRoutes from './routes/aiRoutes';
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
import companyRoutes from './api/company';
import serviceRoutes from './api/services';
import advisorRoutes from './api/advisor';
import treasurerRoutes from './api/treasurer';
import coordinatorRoutes from './api/coordinator';
import clanBuyRoutes from './api/clanBuy';
import petRoutes from './api/pet';
import blindBoxRoutes from './api/blindBox';
import flashDropRoutes from './api/flashDrop';
import videoUploadRoutes from './api/videoUpload';
import videoUploadSimpleRoutes from './api/video-upload-simple';
import aiContentRoutes from './api/aiContent';
import searchRoutes from './api/search';
import chatRoutes from './api/chat';
import viralRoutes from './api/viral';
import gamesRoutes from './api/games';
import walletRoutes from './api/wallet';
import trackingRoutes from './api/tracking';
import { queue } from './lib/queue';
import { processContentSyncJob } from './services/coordinatorService';
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

// Fix database schema issues on startup (role column enum to varchar)
import { fixRoleColumn } from './utils/fix-role-column';
fixRoleColumn().catch((err) => {
  console.warn('[STARTUP] ⚠️ Database fix error (non-fatal):', err);
});

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
// CRITICAL: Use PORT from environment or default to 10000 for Render compatibility
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000;
const HOST = '0.0.0.0'; // CRITICAL: Bind to 0.0.0.0 (not localhost) for Render/cloud platforms
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy (required for Render, Vercel, and other hosting platforms)
// Configure trust proxy to only trust the first proxy (Render's load balancer)
// This prevents rate limiting bypass while still working with Render
app.set('trust proxy', 1); // Trust only the first proxy (Render's load balancer)

// CRITICAL: Register health check endpoint FIRST, before ALL middleware
// This ensures it completely bypasses all middleware (CORS, CSRF, rate limiting, etc.)
// and responds instantly (< 100ms) for Render health checks
app.get('/api/health', (req: Request, res: Response) => {
  // Return plain text "OK" instantly - no processing, no middleware overhead, no database calls
  res.status(200).type('text/plain').send('OK');
});

// Initialize Socket.IO
initializeSocket(server);

// Security: Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
// Explicitly allow required origins with credentials enabled
// CRITICAL: Frontend origin must be explicitly listed FIRST (not relying on wildcard/regex)
const allowedOriginPatterns: (string | RegExp)[] = NODE_ENV === 'production'
  ? [
      // CRITICAL: Explicitly allowed origins (listed FIRST for priority - NO wildcards here)
      'https://banda-chao-frontend.onrender.com', // Primary frontend - MUST be explicit
      'http://localhost:3000',
      // Additional production URLs
      FRONTEND_URL,
      'https://bandachao.com',
      'https://www.bandachao.com',
      'https://banda-chao.vercel.app',
      'https://banda-chao.onrender.com',
      // LOCAL DEVELOPMENT against production API (for testing)
      'http://localhost:3001',
      'http://localhost:10000',
      /^http:\/\/localhost:\d+$/, // Allow any localhost port
      // Vercel Preview URLs (dynamic - using regex pattern)
      /^https:\/\/.*\.vercel\.app$/, // Matches all *.vercel.app subdomains
      // Render URLs (fallback pattern - explicit origin above takes priority)
      /^https:\/\/.*\.onrender\.com$/, // Matches all *.onrender.com subdomains
    ].filter(Boolean)
  : [
      // CRITICAL: Explicitly allowed origins (listed FIRST for priority)
      'https://banda-chao-frontend.onrender.com', // Primary frontend - MUST be explicit
      'http://localhost:3000',
      // Additional development URLs
      FRONTEND_URL,
      'http://localhost:10000',
      'https://banda-chao.vercel.app',
      'https://banda-chao.onrender.com',
      // Vercel Preview URLs (for development/testing)
      /^https:\/\/.*\.vercel\.app$/, // Matches all *.vercel.app subdomains
      // Render URLs (fallback pattern - explicit origin above takes priority)
      /^https:\/\/.*\.onrender\.com$/, // Matches all *.onrender.com subdomains
    ].filter(Boolean);

// CORS middleware with full support for OPTIONS requests
// TEMPORARY FIX: Allow all origins (*) to rule out CORS errors during deployment
// TODO: Restrict to specific origins once deployment is stable
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // TEMPORARY: Allow all origins to rule out CORS errors
    // TODO: Restrict to allowedOriginPatterns once deployment is stable
    if (true) { // Temporarily always allow
      callback(null, true);
      return;
    }
    
    // In development, allow all origins for easier testing
    if (NODE_ENV === 'development') {
      console.log(`[CORS] ✅ Development mode - Allowing origin: ${origin}`);
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
    
    // TEMPORARY: Allow all origins to rule out CORS errors
    // TODO: Restrict to allowedOriginPatterns once deployment is stable
    callback(null, true);
    return;
    
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

// Legacy rate limiters (kept for backward compatibility)
const authLimiter = authRateLimiter;
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

// Serve Next.js static files and frontend
// Use process.cwd() for Render deployment compatibility
const PROJECT_ROOT = process.cwd();

// Diagnostic logs for debugging on Render
console.log('[DIAGNOSTIC] 🔍 Project root:', PROJECT_ROOT);
console.log('[DIAGNOSTIC] 🔍 __dirname:', __dirname);

try {
  const rootContents = fs.readdirSync(PROJECT_ROOT);
  console.log('[DIAGNOSTIC] 📁 PROJECT_ROOT contents:', rootContents.slice(0, 20).join(', '), '...');
} catch (err) {
  console.log('[DIAGNOSTIC] ❌ Cannot read PROJECT_ROOT:', err);
}

try {
  const nextDir = path.join(PROJECT_ROOT, '.next');
  if (fs.existsSync(nextDir)) {
    const nextContents = fs.readdirSync(nextDir);
    console.log('[DIAGNOSTIC] 📁 .next directory exists. Contents:', nextContents.join(', '));
  } else {
    console.log('[DIAGNOSTIC] ❌ .next directory does not exist');
  }
} catch (err) {
  console.log('[DIAGNOSTIC] ❌ Cannot read .next directory:', err);
}

try {
  const standaloneDir = path.join(PROJECT_ROOT, '.next', 'standalone');
  if (fs.existsSync(standaloneDir)) {
    const standaloneContents = fs.readdirSync(standaloneDir);
    console.log('[DIAGNOSTIC] 📁 .next/standalone directory exists. Contents:', standaloneContents.join(', '));
    
    const standaloneNextDir = path.join(standaloneDir, '.next', 'static');
    if (fs.existsSync(standaloneNextDir)) {
      const standaloneStaticContents = fs.readdirSync(standaloneNextDir);
      console.log('[DIAGNOSTIC] 📁 .next/standalone/.next/static exists. Contents:', standaloneStaticContents.slice(0, 10).join(', '), '...');
    } else {
      console.log('[DIAGNOSTIC] ❌ .next/standalone/.next/static does not exist');
    }
  } else {
    console.log('[DIAGNOSTIC] ❌ .next/standalone directory does not exist');
  }
} catch (err) {
  console.log('[DIAGNOSTIC] ❌ Cannot read .next/standalone directory:', err);
}

// Define all paths based on PROJECT_ROOT
const nextStaticPath = path.join(PROJECT_ROOT, '.next', 'static');
const publicPath = path.join(PROJECT_ROOT, 'public');
const standalonePath = path.join(PROJECT_ROOT, '.next', 'standalone');
const standalonePublicPath = path.join(standalonePath, 'public');
const standaloneStaticPath = path.join(standalonePath, '.next', 'static');

console.log('[DIAGNOSTIC] 📍 Paths:');
console.log('[DIAGNOSTIC]   - publicPath:', publicPath, fs.existsSync(publicPath) ? '✅' : '❌');
console.log('[DIAGNOSTIC]   - nextStaticPath:', nextStaticPath, fs.existsSync(nextStaticPath) ? '✅' : '❌');
console.log('[DIAGNOSTIC]   - standalonePath:', standalonePath, fs.existsSync(standalonePath) ? '✅' : '❌');
console.log('[DIAGNOSTIC]   - standalonePublicPath:', standalonePublicPath, fs.existsSync(standalonePublicPath) ? '✅' : '❌');
console.log('[DIAGNOSTIC]   - standaloneStaticPath:', standaloneStaticPath, fs.existsSync(standaloneStaticPath) ? '✅' : '❌');

// Priority 1: Serve Next.js static assets from standalone build (production)
if (fs.existsSync(standaloneStaticPath)) {
  console.log('[STATIC] ✅ Serving /_next/static from standalone build');
  app.use('/_next/static', express.static(standaloneStaticPath));
} else if (fs.existsSync(nextStaticPath)) {
  // Fallback to development build location
  console.log('[STATIC] ✅ Serving /_next/static from dev build');
  app.use('/_next/static', express.static(nextStaticPath));
} else {
  console.log('[STATIC] ⚠️ No /_next/static directory found');
}

// Priority 2: Serve public files from standalone build (production)
if (fs.existsSync(standalonePublicPath)) {
  console.log('[STATIC] ✅ Serving public files from standalone build');
  app.use(express.static(standalonePublicPath));
} else if (fs.existsSync(publicPath)) {
  // Fallback to development build location
  console.log('[STATIC] ✅ Serving public files from dev build');
  app.use(express.static(publicPath));
} else {
  console.log('[STATIC] ⚠️ No public directory found');
}

// Temporary: Store last KPIs error in memory (shared with founder.ts)
// This will be populated by founder.ts when an error occurs
(global as any).lastKPIsError = null;

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
app.use('/api/ai', brainAiRoutes); // AI Brain routes (Neuro-Genesis)
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/advisor', advisorRoutes);
app.use('/api/v1/treasurer', treasurerRoutes);
app.use('/api/v1/coordinator', coordinatorRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/ops', opsRoutes);
app.use('/api/v1/speech', speechRoutes);
app.use('/api/v1/beta', betaRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/clan-buy', clanBuyRoutes);
app.use('/api/v1/pet', petRoutes);
app.use('/api/v1/blind-box', blindBoxRoutes);
app.use('/api/v1/flash-drop', flashDropRoutes);
app.use('/api/v1/video-upload', videoUploadRoutes);
app.use('/api/v1/video-upload-simple', videoUploadSimpleRoutes);
app.use('/api/v1/ai-content', aiContentRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/viral', viralRoutes);
app.use('/api/v1/games', gamesRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/tracking', trackingRoutes);

// Catch-all route to serve Next.js frontend (must be after all API routes)
// This serves index.html for all non-API routes to enable client-side routing
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes - they should be handled above
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Priority 1: Try Next.js standalone build index.html (production)
  const standaloneIndexPath = path.join(PROJECT_ROOT, '.next', 'standalone', '.next', 'server', 'app', 'index.html');
  if (fs.existsSync(standaloneIndexPath)) {
    console.log('[CATCH-ALL] ✅ Serving index.html from standalone:', standaloneIndexPath);
    return res.sendFile(path.resolve(standaloneIndexPath));
  }

  // Priority 2: Try public/index.html (fallback)
  const publicIndexPath = path.join(PROJECT_ROOT, 'public', 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    console.log('[CATCH-ALL] ✅ Serving index.html from public:', publicIndexPath);
    return res.sendFile(path.resolve(publicIndexPath));
  }

  // If no index.html found, continue to 404 handler
  console.log('[CATCH-ALL] ❌ No index.html found. Tried:', standaloneIndexPath, 'and', publicIndexPath);
  return next();
});

// 404 handler (for API routes that don't match)
app.use((req: Request, res: Response) => {
  // Only return JSON 404 for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      code: 'NOT_FOUND',
    });
  }

  // For non-API routes, try to serve frontend index.html
  const standaloneIndexPath = path.join(PROJECT_ROOT, '.next', 'standalone', '.next', 'server', 'app', 'index.html');
  if (fs.existsSync(standaloneIndexPath)) {
    return res.sendFile(path.resolve(standaloneIndexPath));
  }

  const publicIndexPath = path.join(PROJECT_ROOT, 'public', 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    return res.sendFile(path.resolve(publicIndexPath));
  }

  // Final fallback
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
// CRITICAL: Bind to 0.0.0.0 (not localhost) to make server accessible from outside (Render requirement)
server.listen(PORT, HOST, async () => {
  console.log(`> Ready on http://${HOST}:${PORT}`);
  console.log(`🚀 Server is running on ${HOST}:${PORT}`);
  console.log(`📡 API: http://${HOST}:${PORT}/api/v1`);
  console.log(`🔌 Socket.IO: http://${HOST}:${PORT}/socket.io`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔍 Health Check: http://${HOST}:${PORT}/api/health`);
  
  // Verify Prisma connection (lightweight check)
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Database connection verified`);
  } catch (err) {
    console.warn(`⚠️ Database connection check failed:`, err);
  }

  // Initialize Queue Processors (Background Jobs)
  console.log(`📦 Initializing queue processors...`);
  
  // Register Coordinator content sync processor
  queue.process(async (job) => {
    if (job.type === 'sync_content') {
      await processContentSyncJob(job);
    } else {
      console.warn(`⚠️ Unknown job type: ${job.type}`);
    }
  });

  // Queue event listeners for monitoring
  queue.on('job:completed', (job) => {
    console.log(`✅ Job completed: ${job.type} (${job.id})`);
  });

  queue.on('job:failed', (job) => {
    console.error(`❌ Job failed: ${job.type} (${job.id}) - ${job.error}`);
  });

  console.log(`✅ Queue processors initialized`);

  // Initialize Atomic Inventory in Redis
  console.log(`📦 Initializing atomic inventory...`);
  try {
    const { syncInventoryToRedis } = await import('./services/inventoryService');
    await syncInventoryToRedis();
    console.log(`✅ Atomic inventory initialized`);
  } catch (err) {
    console.warn(`⚠️ Inventory sync failed (will use database fallback):`, err);
  }
});

// Export app for testing
export default app;

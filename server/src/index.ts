import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { setupWebSocketHandlers } from './services/websocket';
import userRoutes from './api/users';
import messageRoutes from './api/messages';
import postRoutes from './api/posts';
import productRoutes from './api/products';
import videoRoutes from './api/videos';
import searchRoutes from './api/search';
import authRoutes from './api/auth';
import seedRoutes from './api/seed';
import oauthRoutes from './api/oauth';
import commentRoutes from './api/comments';
import orderRoutes from './api/orders';
import notificationRoutes from './api/notifications';
import makerRoutes from './api/makers';
import aiRoutes from './api/ai';
import paymentRoutes from './api/payments';
import founderRoutes from './api/founder';
import founderSessionRoutes from './api/founder-sessions';
import moderationRoutes from './api/moderation';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Basic startup log for Render diagnostics (no secrets)
console.log('Server starting...', {
  node: process.version,
  env: process.env.NODE_ENV || 'development',
  port: PORT,
});

// Check critical environment variables at startup
const hasGeminiKey = !!process.env.GEMINI_API_KEY;
const hasJwtSecret = !!process.env.JWT_SECRET;
const hasDatabaseUrl = !!process.env.DATABASE_URL;

console.log('🔍 Environment Variables Check:', {
  GEMINI_API_KEY: hasGeminiKey ? '✅ Configured' : '❌ MISSING',
  JWT_SECRET: hasJwtSecret ? '✅ Configured' : '⚠️  Missing',
  DATABASE_URL: hasDatabaseUrl ? '✅ Configured' : '⚠️  Missing',
});

if (!hasGeminiKey) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set - AI Assistant features will not work!');
  console.warn('   Please set GEMINI_API_KEY in your environment variables or .env file');
}

// Create HTTP server
const httpServer = createServer(app);

// CORS allowed origins (moved to cors middleware)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://banda-chao-frontend.onrender.com',
  'https://banda-chao.vercel.app',
  'https://banda-chao.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Initialize Socket.IO with comprehensive CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  }
});

// SIMPLE AND RELIABLE GLOBAL CORS - Applied to ALL routes
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    console.log(`✅ CORS Preflight: ${req.method} ${req.path} from ${req.get('Origin') || 'unknown'}`);
    return res.sendStatus(204);
  }
  
  next();
});

console.log('✅ Global CORS middleware applied - ALL routes will include CORS headers');

app.use(morgan('dev'));

// Stripe webhook must use raw body for signature verification
// This must come BEFORE express.json() middleware
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint (CORS headers added by global middleware)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Banda Chao Server is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Setup WebSocket handlers
setupWebSocketHandlers(io);

// API routes

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', seedRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/makers', makerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/founder', founderRoutes);
app.use('/api/v1/founder/sessions', founderSessionRoutes);
app.use('/api/v1/moderation', moderationRoutes);

// 404 handler (CORS headers added by global middleware)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    cors: 'enabled'
  });
});

// Error handling middleware (CORS headers added by global middleware)
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Prisma errors
  if (err.message.includes('Unique constraint')) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
      cors: 'enabled'
    });
  }

  if (err.message.includes('Record to update not found')) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Resource not found',
      cors: 'enabled'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    cors: 'enabled'
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server is ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export io for use in other modules
export { io };



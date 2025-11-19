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

// Create HTTP server
const httpServer = createServer(app);

// CORS allowed origins
const allowedOrigins = [
  'https://banda-chao-frontend.onrender.com',
  'https://banda-chao.vercel.app',
  'http://localhost:3000',
  // Allow environment variable to add additional origins
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log blocked origin for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        console.warn(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Banda Chao Server is running',
    timestamp: new Date().toISOString()
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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware (must be last)
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Prisma errors
  if (err.message.includes('Unique constraint')) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }

  if (err.message.includes('Record to update not found')) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Resource not found'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
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


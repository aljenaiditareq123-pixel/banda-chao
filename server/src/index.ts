import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupWebSocketHandlers } from './services/websocket';
import userRoutes from './api/users';
import messageRoutes from './api/messages';
import postRoutes from './api/posts';
import productRoutes from './api/products';
import authRoutes from './api/auth';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/v1/auth', authRoutes);

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


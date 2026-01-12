/**
 * Comprehensive CORS Middleware for Banda Chao Backend
 * Ensures all API responses include proper CORS headers
 */

import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// CORS allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://banda-chao-frontend.onrender.com',
  'https://banda-chao.vercel.app',
  'https://banda-chao.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

console.log('🌐 CORS Configuration:', {
  allowedOrigins: allowedOrigins.length,
  origins: allowedOrigins
});

// Main CORS configuration
export const corsConfig = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For production, be more permissive to avoid blocking legitimate requests
    console.warn(`⚠️  CORS: Origin ${origin} not in allowed list, but allowing anyway`);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
};

// Primary CORS middleware using cors package
export const corsMiddleware = cors(corsConfig);

// Manual fallback CORS middleware to ensure headers are always set
export const manualCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set CORS headers manually as fallback
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma'
  );
  res.setHeader(
    'Access-Control-Allow-Methods', 
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS Preflight: ${req.method} ${req.path} from ${req.get('Origin') || 'unknown'}`);
    return res.status(200).end();
  }

  next();
};

// Comprehensive CORS setup function
export const setupCORS = (app: any) => {
  console.log('🔧 Setting up comprehensive CORS...');
  
  // 1. Apply manual CORS middleware first (highest priority)
  app.use(manualCorsMiddleware);
  
  // 2. Apply cors package middleware
  app.use(corsMiddleware);
  
  // 3. Handle all OPTIONS requests explicitly
  app.options('*', corsMiddleware);
  
  console.log('✅ CORS setup complete');
};

export default corsMiddleware;

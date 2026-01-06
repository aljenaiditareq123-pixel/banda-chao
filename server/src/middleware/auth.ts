import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // If no token in header, try to get from cookie
  if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    console.warn('[AUTH_MIDDLEWARE] No token provided for:', req.path);
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  // SECURITY: Kill Switch - JWT_SECRET must be set (validated at startup)
  // If we reach here without JWT_SECRET in production, something is wrong
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    // This should never happen in production (server would have exited at startup)
    // But we check here as a safety measure
    if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
      console.error('[AUTH_MIDDLEWARE] FATAL: JWT_SECRET missing at runtime - this should be impossible!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - authentication unavailable',
      });
    }
    // Development fallback (local testing only)
    console.warn('[AUTH_MIDDLEWARE] JWT_SECRET not found, using development fallback (NOT SECURE)');
    const devFallback = 'dev-secret-only-local-never-use-in-production';
    // Use dev fallback but log warning
    const decoded = jwt.verify(token, devFallback) as { 
      userId: string; 
      email: string; 
      name?: string;
      role: string;
    };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      role: decoded.role,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret!) as { 
      userId: string; 
      email: string; 
      name?: string;
      role: string;
    };
    req.userId = decoded.userId;
    
    // Set user from decoded token (faster, no DB query needed for every request)
    // The token already contains user info, so we trust it
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0], // Fallback to email prefix if name not in token
      role: decoded.role,
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH_MIDDLEWARE] User authenticated:', {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
        path: req.path,
      });
    }
    
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Token verification failed:', {
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      console.warn('[AUTH_MIDDLEWARE] No user role found for:', req.path);
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn('[AUTH_MIDDLEWARE] Insufficient permissions:', {
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        email: req.user.email,
      });
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH_MIDDLEWARE] Role check passed:', {
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
    }

    next();
  };
}

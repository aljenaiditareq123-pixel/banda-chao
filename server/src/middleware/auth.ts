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
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not set');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { 
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
    
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

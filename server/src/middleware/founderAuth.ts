import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from './auth';
import { AuthRequest } from './auth';
import { prisma } from '../utils/prisma';

// Re-export AuthRequest for convenience
export { AuthRequest } from './auth';

/**
 * Middleware to ensure user is FOUNDER
 * Must be used after authenticateToken middleware
 * 
 * Security: Checks role from JWT token first, then verifies against database
 */
export const requireFounder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // First, ensure user is authenticated
    if (!req.userId) {
      console.warn('[Auth] Non-founder tried to access founder route - not authenticated', { 
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        message: 'Unauthorized: founder access only',
        error: 'Authentication required'
      });
    }

    // Try to get role from JWT token first (faster, no DB query)
    const authHeader = req.headers['authorization'];
    let tokenRole: string | null = null;
    
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.trim().split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        const token = parts[1];
        try {
          const jwt = require('jsonwebtoken');
          const decoded: any = jwt.decode(token);
          tokenRole = decoded?.role || null;
        } catch (e) {
          // Token decode failed, will check DB
        }
      }
    }

    // Also try from cookies
    if (!tokenRole && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' && value) {
          try {
            const jwt = require('jsonwebtoken');
            const decoded: any = jwt.decode(value);
            tokenRole = decoded?.role || null;
          } catch (e) {
            // Token decode failed, will check DB
          }
          break;
        }
      }
    }

    // If role from token is FOUNDER, allow immediately (fast path)
    if (tokenRole === 'FOUNDER') {
      next();
      return;
    }

    // Otherwise, verify against database (more secure, ensures role is up-to-date)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true, email: true, id: true },
    });

    if (!user) {
      console.warn('[Auth] Non-founder tried to access founder route - user not found', { 
        path: req.path,
        userId: req.userId
      });
      return res.status(401).json({
        message: 'Unauthorized: founder access only',
        error: 'User not found'
      });
    }

    // Check if user has FOUNDER role
    if (user.role !== 'FOUNDER') {
      console.warn('[Auth] Non-founder tried to access founder route', { 
        path: req.path,
        method: req.method,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role
      });
      return res.status(401).json({
        message: 'Unauthorized: founder access only',
        error: 'FOUNDER role required'
      });
    }

    // User is authenticated and has FOUNDER role, continue
    next();
  } catch (error: any) {
    console.error('[FounderAuth] Error verifying founder status:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Failed to verify founder status'
    });
  }
};

/**
 * Combined middleware: authenticate + require founder
 */
export const authenticateFounder = [
  authenticateToken,
  requireFounder,
];


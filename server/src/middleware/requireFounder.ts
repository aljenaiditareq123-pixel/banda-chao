/**
 * Middleware to ensure only founder can access certain routes
 */

import { Request, Response, NextFunction } from 'express';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export const requireFounder = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // This middleware should be used AFTER authenticateToken
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Check if user has founder role
  if (req.user.role !== 'FOUNDER') {
    console.warn(`[RequireFounder] Access denied for user ${req.user.id} with role ${req.user.role}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Founder privileges required'
    });
  }

  // User is founder, proceed
  next();
};

import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from './auth';
import { AuthRequest } from './auth';
import { prisma } from '../utils/prisma';

// Re-export AuthRequest for convenience
export { AuthRequest } from './auth';

/**
 * Middleware to ensure user is FOUNDER
 * Must be used after authenticateToken middleware
 */
export const requireFounder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // First, ensure user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true, email: true },
    });

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User does not exist',
      });
    }

    // Check if user has FOUNDER role
    if (user.role !== 'FOUNDER') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'FOUNDER role required',
      });
    }

    // User is authenticated and has FOUNDER role, continue
    next();
  } catch (error: any) {
    console.error('[FounderAuth] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify founder status',
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


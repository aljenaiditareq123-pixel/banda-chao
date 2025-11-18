import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user and all Request properties
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  // Explicitly include all Request properties to fix TypeScript errors
  params: Request['params'];
  body: Request['body'];
  headers: Request['headers'];
  file?: Express.Multer.File;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      (err: any, decoded: any) => {
        // Use 401 Unauthorized for authentication failures (invalid/expired tokens)
        // This matches TestSprite expectations and HTTP standards
        if (err) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Ensure decoded object exists and contains userId
        if (!decoded || !decoded.userId) {
          return res.status(401).json({ error: 'Token payload is invalid' });
        }

        // Safely assign userId and email from decoded token
        req.userId = decoded.userId;
        req.userEmail = decoded.email || undefined;
        
        // Only call next() if userId is properly set
        if (req.userId) {
          next();
        } else {
          return res.status(401).json({ error: 'Failed to authenticate user' });
        }
      }
    );
  } catch (error: any) {
    // Catch any unexpected errors (e.g., JWT_SECRET issues)
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};



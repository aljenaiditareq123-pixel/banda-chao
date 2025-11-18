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
    // TEST MODE: Skip authentication if TEST_MODE=true
    // This allows automated testing tools (like TestSprite) to work without tokens
    // IMPORTANT: Only enable this in test environments, NEVER in production
    if (process.env.TEST_MODE === 'true') {
      // Set fake user data for test mode
      req.userId = 'test-user';
      req.userEmail = 'test@example.com';
      // Continue to the next middleware/route handler
      return next();
    }

    // Normal authentication mode (check for Bearer token or cookies)
    // Check for Bearer token in Authorization header (for external tools like TestSprite)
    // Format: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    let token: string | null = null;

    if (authHeader && typeof authHeader === 'string') {
      // Extract token from "Bearer <token>" format
      const parts = authHeader.trim().split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    // If no Bearer token found, try to get token from cookies (for browser requests)
    // This allows normal website users to authenticate via cookies if implemented
    if (!token && req.headers.cookie) {
      // Extract token from cookie if it exists (format: token=<jwt>)
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' && value) {
          token = value;
          break;
        }
      }
    }

    // If still no token found, return 401
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid token in the Authorization header as "Bearer <token>" or in cookies'
      });
    }

    // Verify the JWT token
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



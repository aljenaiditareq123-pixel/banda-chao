/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for stateless JWT authentication
 */

import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHmac } from 'crypto';

// Store CSRF secrets in memory (in production, consider Redis)
const csrfSecrets = new Map<string, string>();

/**
 * Generate CSRF token
 */
export function generateCsrfToken(req: Request): string {
  const userId = (req as any).userId || req.ip || 'anonymous';
  const secret = randomBytes(32).toString('hex');
  
  // Store secret (in production, use Redis with TTL)
  csrfSecrets.set(userId, secret);
  
  // Generate token
  const token = createHmac('sha256', secret)
    .update(userId + Date.now().toString())
    .digest('hex');
  
  return token;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(req: Request, token: string): boolean {
  const userId = (req as any).userId || req.ip || 'anonymous';
  const secret = csrfSecrets.get(userId);
  
  if (!secret) {
    return false;
  }
  
  // Verify token format (basic check)
  // In production, implement proper token validation
  return token && token.length === 64; // SHA256 hex = 64 chars
}

/**
 * CSRF Protection Middleware
 * Protects all state-changing operations (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints (login, register)
  const publicEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register'];
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }

  // Skip CSRF for webhooks (they have their own signature verification)
  if (req.path.includes('/webhook')) {
    return next();
  }

  // Get CSRF token from header
  const csrfToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.['csrf-token'];

  // Verify token
  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      code: 'CSRF_ERROR',
    });
  }

  // Verify token format
  if (!verifyCsrfToken(req, csrfToken)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_ERROR',
    });
  }

  next();
}

/**
 * Generate and send CSRF token (for GET requests)
 */
export function csrfTokenHandler(req: Request, res: Response, next: NextFunction) {
  // Only for GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Generate token
  const token = generateCsrfToken(req);

  // Set cookie (httpOnly: false so frontend can read it)
  res.cookie('csrf-token', token, {
    httpOnly: false, // Frontend needs to read it
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Send token in response header (for API clients)
  res.setHeader('X-CSRF-Token', token);

  next();
}


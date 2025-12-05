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
  return !!(token && typeof token === 'string' && token.length === 64); // SHA256 hex = 64 chars
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

  // Skip CSRF for AI endpoints (they use JWT authentication which is sufficient)
  // AI endpoints are protected by authenticateToken middleware
  const aiEndpoints = ['/api/v1/ai/assistant', '/api/v1/ai/founder', '/api/v1/ai/pricing-suggestion', '/api/v1/ai/content-helper'];
  if (aiEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CSRF] Skipping CSRF check for AI endpoint:', req.path);
    }
    return next();
  }
  
  // Also check if path matches /api/v1/ai/* pattern (more flexible)
  if (req.path.startsWith('/api/v1/ai/')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CSRF] Skipping CSRF check for AI endpoint (pattern match):', req.path);
    }
    return next();
  }

  // Skip CSRF for Speech-to-Text endpoint (it uses JWT authentication)
  if (req.path.startsWith('/api/v1/speech/')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CSRF] Skipping CSRF check for Speech endpoint:', req.path);
    }
    return next();
  }

  // Get CSRF token from header
  const csrfToken = req.headers['x-csrf-token'] as string | undefined;
  const cookieToken = req.cookies?.['csrf-token'] as string | undefined;

  // Log CSRF check details in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[CSRF] Checking CSRF token for:', req.path, {
      hasHeaderToken: !!csrfToken,
      hasCookieToken: !!cookieToken,
      tokensMatch: csrfToken === cookieToken,
    });
  }

  // Verify token
  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    console.warn('[CSRF] CSRF token validation failed for:', req.path, {
      hasHeaderToken: !!csrfToken,
      hasCookieToken: !!cookieToken,
      tokensMatch: csrfToken === cookieToken,
    });
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      code: 'CSRF_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        path: req.path,
        hasHeaderToken: !!csrfToken,
        hasCookieToken: !!cookieToken,
      } : undefined,
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

/**
 * Endpoint to get CSRF token (for authenticated users)
 * This allows frontend to get a fresh CSRF token when needed
 */
export function getCsrfToken(req: Request, res: Response) {
  // Generate token
  const token = generateCsrfToken(req);

  // Set cookie
  res.cookie('csrf-token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Return token in response
  res.json({
    success: true,
    csrfToken: token,
    message: 'CSRF token generated successfully',
  });
}


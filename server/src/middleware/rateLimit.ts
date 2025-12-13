/**
 * Rate Limiting Middleware - حماية API من الهجمات والضغط غير الطبيعي
 * 
 * هذا الـ Middleware يحمي النظام من:
 * - DDoS Attacks
 * - Brute Force Attacks
 * - API Abuse
 * - Resource Exhaustion
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter Configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

/**
 * Default Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const defaultRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Strict Rate Limiter (for sensitive endpoints)
 * 20 requests per 15 minutes per IP
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter (for login/signup)
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * User-based Rate Limiter
 * 1000 requests per hour per authenticated user
 */
export const userRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise use IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : req.ip || 'unknown';
  },
  skip: (req: Request) => {
    // Skip rate limiting for certain paths
    return req.path.startsWith('/health') || req.path.startsWith('/metrics');
  },
});

/**
 * API Rate Limiter (for general API endpoints)
 * 200 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: 'API rate limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Interaction Rate Limiter (for likes, comments, etc.)
 * 50 interactions per minute per user
 */
export const interactionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 interactions per minute
  message: 'Too many interactions, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return req.ip || 'unknown';
    }
    return `interaction:${userId}`;
  },
});

/**
 * Upload Rate Limiter (for file uploads)
 * 10 uploads per hour per user
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    return userId ? `upload:${userId}` : req.ip || 'unknown';
  },
});

/**
 * Custom Rate Limiter Factory
 * لإنشاء rate limiters مخصصة
 */
export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message || 'Too many requests, please try again later.',
    standardHeaders: config.standardHeaders !== false,
    legacyHeaders: config.legacyHeaders || false,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    keyGenerator: config.keyGenerator,
    skip: config.skip,
  });
}

/**
 * Dynamic Rate Limiter based on user role
 * VIP users get higher limits
 */
export const roleBasedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: Request) => {
    const user = (req as any).user;
    if (!user) return 50; // Anonymous: 50 requests
    
    // Role-based limits
    switch (user.role) {
      case 'FOUNDER':
      case 'ADMIN':
        return 1000; // Admins: 1000 requests
      case 'MAKER':
        return 500; // Makers: 500 requests
      case 'VIP':
        return 300; // VIP users: 300 requests
      default:
        return 100; // Regular users: 100 requests
    }
  },
  message: 'Rate limit exceeded for your user role.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    return userId ? `role:${userId}` : req.ip || 'unknown';
  },
});

/**
 * Middleware to add rate limit headers to response
 */
export function rateLimitHeaders(req: Request, res: Response, next: NextFunction) {
  const rateLimitInfo = {
    limit: res.getHeader('X-RateLimit-Limit'),
    remaining: res.getHeader('X-RateLimit-Remaining'),
    reset: res.getHeader('X-RateLimit-Reset'),
  };

  // Add custom header with rate limit info
  if (rateLimitInfo.limit) {
    res.setHeader('X-RateLimit-Info', JSON.stringify(rateLimitInfo));
  }

  next();
}

/**
 * Helper to check if request should be rate limited
 */
export function shouldRateLimit(req: Request): boolean {
  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return false;
  }

  // Skip rate limiting for metrics (if authenticated as admin)
  if (req.path === '/metrics' && (req as any).user?.role === 'ADMIN') {
    return false;
  }

  return true;
}

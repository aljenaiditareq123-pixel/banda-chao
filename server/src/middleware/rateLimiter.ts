/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DoS attacks
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: Request) => string; // Custom key generator
}

class RateLimiter {
  private store: RateLimitStore = {};
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      message: options.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      keyGenerator: options.keyGenerator || this.defaultKeyGenerator,
    };

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private defaultKeyGenerator(req: Request): string {
    // Use IP address as default key
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.options.keyGenerator(req);
      const now = Date.now();

      // Initialize or reset if window expired
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 0,
          resetTime: now + this.options.windowMs,
        };
      }

      // Check if limit exceeded
      if (this.store[key].count >= this.options.maxRequests) {
        const resetTime = Math.ceil((this.store[key].resetTime - now) / 1000);
        
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: this.options.message,
          retryAfter: resetTime,
          limit: this.options.maxRequests,
          windowMs: this.options.windowMs,
        });
        return;
      }

      // Increment counter
      this.store[key].count++;

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.options.maxRequests.toString(),
        'X-RateLimit-Remaining': (this.options.maxRequests - this.store[key].count).toString(),
        'X-RateLimit-Reset': new Date(this.store[key].resetTime).toISOString(),
      });

      // Handle response to potentially skip counting
      if (this.options.skipSuccessfulRequests || this.options.skipFailedRequests) {
        const originalSend = res.send;
        const rateLimiterInstance = this;
        res.send = function(body: any) {
          const statusCode = res.statusCode;
          
          // Decrement counter if we should skip this request
          if (
            (rateLimiterInstance.options.skipSuccessfulRequests && statusCode < 400) ||
            (rateLimiterInstance.options.skipFailedRequests && statusCode >= 400)
          ) {
            rateLimiterInstance.store[key].count--;
          }
          
          return originalSend.call(this, body);
        };
      }

      next();
    };
  }
}

// Pre-configured rate limiters for different use cases

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
}).middleware();

/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per 15 minutes per IP
 */
export const strictRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many requests to this endpoint, please try again after 15 minutes.',
}).middleware();

/**
 * Auth rate limiter for login/register endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
}).middleware();

/**
 * AI rate limiter for AI assistant endpoints
 * 30 requests per 10 minutes per IP
 */
export const aiRateLimit = new RateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 30,
  message: 'Too many AI requests, please try again after 10 minutes.',
}).middleware();

/**
 * Upload rate limiter for file upload endpoints
 * 20 uploads per hour per IP
 */
export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20,
  message: 'Too many file uploads, please try again after 1 hour.',
}).middleware();

/**
 * Search rate limiter for search endpoints
 * 60 searches per 10 minutes per IP
 */
export const searchRateLimit = new RateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 60,
  message: 'Too many search requests, please try again after 10 minutes.',
}).middleware();

/**
 * Founder AI rate limiter for founder-only AI endpoints
 * More generous limits for single founder user
 * 50 requests per 15 minutes per IP
 */
export const founderAIRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50,
  message: 'Too many founder AI requests, please try again after 15 minutes.',
}).middleware();

/**
 * Custom rate limiter factory
 */
export function createRateLimit(options: RateLimitOptions) {
  return new RateLimiter(options).middleware();
}

export default RateLimiter;

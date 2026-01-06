import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { captureException } from '../utils/sentry';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error with context
  const errorContext = {
    method: req.method,
    path: req.path,
    userId: (req as any).userId || 'anonymous',
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  };

  console.error('❌ Error occurred:', JSON.stringify(errorContext, null, 2));

  // Send to Sentry
  captureException(err as Error, {
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        'user-agent': req.get('user-agent'),
        'content-type': req.get('content-type'),
      },
    },
    user: {
      id: (req as any).userId || 'anonymous',
    },
  });

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    console.error('Database error:', err.code, err.meta);
    
    // SECURITY: Never expose stack traces or database structure in production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    return res.status(500).json({
      success: false,
      message: err.message || 'Database operation failed',
      code: 'DATABASE_ERROR',
      // Only include error details in development
      ...(isProduction ? {} : {
        error: {
          message: err.message,
          code: err.code,
          meta: err.meta,
        },
      }),
      context: {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err instanceof PrismaClientValidationError) {
    console.error('Validation error:', err.message);
    
    // SECURITY: Never expose stack traces in production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    
    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid data provided',
      code: 'VALIDATION_ERROR',
      // Only include error details in development
      ...(isProduction ? {} : {
        error: {
          message: err.message,
        },
      }),
      context: {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Handle custom AppError
  if ('statusCode' in err && err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || 'ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: err.details }),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'AUTH_ERROR',
    });
  }

  // Default error response
  // SECURITY: Never expose stack traces or internal error details in production
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  
  res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    // Only include error details in development (never in production)
    ...(isProduction ? {} : {
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    }),
    // Include minimal context (safe to expose)
    context: {
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
}

export function createError(message: string, statusCode: number = 500, code?: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}


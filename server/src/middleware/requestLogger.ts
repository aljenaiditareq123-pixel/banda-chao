import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Only log in development
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  const startTime = Date.now();

  // Log request
  console.log(`📥 ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - startTime;
    
    console.log(`📤 ${req.method} ${req.path} ${res.statusCode} - ${responseTime}ms`);
    
    return originalSend.call(this, body);
  };

  next();
}


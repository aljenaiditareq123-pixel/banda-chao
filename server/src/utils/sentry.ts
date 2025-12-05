/**
 * Sentry Configuration for Backend
 * Error tracking and monitoring
 */

import * as Sentry from '@sentry/node';

// Profiling integration (optional - only if package is installed)
let nodeProfilingIntegration: (() => any) | null = null;
try {
  const profilingModule = require('@sentry/profiling-node');
  if (profilingModule && typeof profilingModule.nodeProfilingIntegration === 'function') {
    nodeProfilingIntegration = profilingModule.nodeProfilingIntegration;
  }
} catch (e) {
  // Profiling package not installed - skip
}

/**
 * Initialize Sentry for Backend
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.warn('[Sentry] SENTRY_DSN is not set. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: nodeProfilingIntegration
      ? [nodeProfilingIntegration() as any]
      : [],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in production, 100% in development
    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.SENTRY_RELEASE || undefined,
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from error events
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        // Remove sensitive query params
        if (event.request.query_string) {
          const queryString = typeof event.request.query_string === 'string' 
            ? event.request.query_string 
            : String(event.request.query_string);
          if (queryString.includes('password') || queryString.includes('token')) {
            event.request.query_string = '[Filtered]';
          }
        }
      }
      return event;
    },
  });

  console.log('[Sentry] ✅ Error tracking initialized for', environment);
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id?: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}


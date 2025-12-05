/**
 * Safe Sentry wrapper - conditionally uses Sentry if available, otherwise no-ops
 * This allows the build to pass even if @sentry/nextjs is not installed
 */

let Sentry: any = null;
let isSentryAvailable = false;

try {
  Sentry = require('@sentry/nextjs');
  isSentryAvailable = true;
} catch (e) {
  // Sentry not installed - use no-op functions
  isSentryAvailable = false;
}

export const captureException = (error: Error, context?: any) => {
  if (isSentryAvailable && Sentry) {
    try {
      Sentry.captureException(error, context);
    } catch (e) {
      console.error('Sentry captureException failed:', e);
    }
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (isSentryAvailable && Sentry) {
    try {
      Sentry.captureMessage(message, level);
    } catch (e) {
      console.error('Sentry captureMessage failed:', e);
    }
  }
};

export const setUser = (user: { id?: string; email?: string; username?: string }) => {
  if (isSentryAvailable && Sentry) {
    try {
      Sentry.setUser(user);
    } catch (e) {
      console.error('Sentry setUser failed:', e);
    }
  }
};

export const clearUser = () => {
  if (isSentryAvailable && Sentry) {
    try {
      Sentry.setUser(null);
    } catch (e) {
      console.error('Sentry clearUser failed:', e);
    }
  }
};

export const initSentry = (config?: any) => {
  if (isSentryAvailable && Sentry) {
    try {
      Sentry.init(config || {
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        debug: false,
      });
    } catch (e) {
      console.error('Sentry init failed:', e);
    }
  }
};


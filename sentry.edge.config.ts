/**
 * Sentry Edge Configuration for Next.js
 * This file configures Sentry for Edge runtime
 * 
 * NOTE: Sentry is conditionally loaded - if @sentry/nextjs is not installed,
 * this file will not cause build errors.
 */

// Conditionally initialize Sentry only if available
try {
  const Sentry = require('@sentry/nextjs');
  
  Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  });
} catch (e) {
  // Sentry not installed - skip initialization
  // This allows the build to pass without @sentry/nextjs
}


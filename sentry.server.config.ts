/**
 * Sentry Server Configuration for Next.js
 * This file configures Sentry for the server-side
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
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
        const queryString = event.request.query_string;
        if (queryString.includes('password') || queryString.includes('token')) {
          event.request.query_string = '[Filtered]';
        }
      }
    }
    return event;
  },
});


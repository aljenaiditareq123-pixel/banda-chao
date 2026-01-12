/**
 * Environment Configuration
 * Centralized environment variable management for the backend
 */

export const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL;

if (!FOUNDER_EMAIL) {
  console.warn('⚠️  FOUNDER_EMAIL is not set – founder-specific features may not work correctly.');
}


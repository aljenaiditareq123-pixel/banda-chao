/**
 * Environment Variable Checks
 * Runtime verification of critical environment variables
 */

/**
 * Check frontend environment variables
 * Logs warnings in development, silent in production
 */
export function checkFrontendEnv(): void {
  if (typeof window === 'undefined') {
    // Server-side, skip check
    return;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[ENV CHECK] NEXT_PUBLIC_API_URL is not set. Using fallback: https://banda-chao-backend.onrender.com'
      );
    }
    return;
  }

  // Check for double prefix
  if (apiUrl.includes('/api/v1')) {
    console.warn(
      '[ENV CHECK] ⚠️ NEXT_PUBLIC_API_URL should NOT include /api/v1. Current value:',
      apiUrl,
      '\nThe /api/v1 prefix is added automatically by getApiUrl().'
    );
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[ENV CHECK] ✅ NEXT_PUBLIC_API_URL:', apiUrl);
  }
}

/**
 * Initialize environment checks
 * Call this once when the app loads
 */
export function initEnvChecks(): void {
  if (typeof window !== 'undefined') {
    checkFrontendEnv();
  }
}


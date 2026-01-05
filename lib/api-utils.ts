/**
 * API Utility Functions
 * Centralized URL handling to prevent double prefix issues
 */

/**
 * Get the API base URL, ensuring no double /api prefix
 * @returns The base URL for API calls (without /api suffix)
 */
export function getApiBaseUrl(): string {
  // Use Next.js proxy in development to bypass CORS
  // The proxy rewrites /api/proxy/* to https://banda-chao-backend.onrender.com/api/*
  if (process.env.NODE_ENV === 'development') {
    return '/api/proxy';
  }

  // In production, use the environment variable or fallback
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!envUrl) {
    // Fallback to production backend URL (should be backend service, not frontend)
    // CRITICAL: This should point to the backend service (banda-chao-backend.onrender.com)
    // NOT the frontend service (banda-chao-frontend.onrender.com or banda-chao.onrender.com)
    const fallbackUrl = 'https://banda-chao-backend.onrender.com';
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] NEXT_PUBLIC_API_URL not set, using fallback:', fallbackUrl);
    }
    return fallbackUrl;
  }

  // Remove trailing slash
  let baseUrl = envUrl.trim().replace(/\/$/, '');

  // Remove /api if it exists at the end (prevent double prefix)
  baseUrl = baseUrl.replace(/\/api$/, '');

  // Log the URL being used (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[API] Using API base URL:', baseUrl);
  }

  return baseUrl;
}

/**
 * Get the full API URL with /api/v1 prefix
 * @returns The full API URL including /api/v1
 */
export function getApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  
  // In development, baseUrl is already '/api/proxy' (relative path for Next.js proxy)
  // The proxy rewrites /api/proxy/* to https://banda-chao-backend.onrender.com/api/v1/*
  // So we don't need to add anything
  if (baseUrl.startsWith('/api/proxy')) {
    return baseUrl; // Already correct, don't modify
  }
  
  // In production, we add '/api/v1' to the base URL
  // Backend expects /api/v1/* endpoints
  const fullUrl = `${baseUrl}/api/v1`;
  
  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[API] Full API URL:', fullUrl);
  }
  
  return fullUrl;
}

/**
 * Build a full API endpoint URL
 * @param endpoint - The endpoint path (e.g., '/products' or 'products')
 * @returns The full URL including base URL and /api
 */
export function buildApiUrl(endpoint: string): string {
  const apiUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiUrl}${cleanEndpoint}`;
}

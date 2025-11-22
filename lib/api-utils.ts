/**
 * Centralized API URL helper utility
 * Provides consistent API base URL construction for both server and client contexts
 */

/**
 * Normalizes an API URL to ensure proper /api/v1 suffix
 */
function normalizeUrl(url: string): string {
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  // If URL already ends with /api/v1, return as is
  if (url.endsWith('/api/v1')) {
    return url;
  }
  
  // If URL ends with /api, append /v1
  if (url.endsWith('/api')) {
    return `${url}/v1`;
  }
  
  // Otherwise, append /api/v1
  return `${url}/api/v1`;
}

/**
 * Gets the API base URL for the current context (server or client)
 * @returns Normalized API base URL with /api/v1 suffix
 */
export function getApiBaseUrl(): string {
  // Server-side: use environment variable or fallback
  if (typeof window === 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
    }
    
    // In development, server can connect to localhost:3001
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001/api/v1';
    }
    
    return 'https://banda-chao.onrender.com/api/v1';
  }

  // Client-side: use environment variable, localhost check, or fallback
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  }

  // Safe check for window.location (only in browser)
  try {
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      return 'http://localhost:3001/api/v1';
    }
  } catch (e) {
    // window.location may not be available - use development fallback
  }

  // Default fallback for client-side development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api/v1';
  }

  return 'https://banda-chao-backend.onrender.com/api/v1';
}

/**
 * Gets the backend base URL without /api/v1 suffix
 * Useful for endpoints that construct their own paths
 */
export function getBackendBaseUrl(): string {
  const apiUrl = getApiBaseUrl();
  // Remove /api/v1 suffix
  return apiUrl.replace(/\/api\/v1$/, '');
}


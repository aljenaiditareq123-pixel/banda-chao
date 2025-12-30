/**
 * API Utility Functions
 * Centralized URL handling to prevent double prefix issues
 */

/**
 * Get the API base URL, ensuring no double /api/v1 prefix
 * @returns The base URL for API calls (without /api/v1 suffix)
 */
export function getApiBaseUrl(): string {
  // Get base URL from environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!envUrl) {
    // Fallback to production URL
    return 'https://banda-chao.onrender.com';
  }

  // Remove trailing slash
  let baseUrl = envUrl.trim().replace(/\/$/, '');

  // Remove /api/v1 if it exists at the end (prevent double prefix)
  baseUrl = baseUrl.replace(/\/api\/v1$/, '');

  return baseUrl;
}

/**
 * Get the full API URL with /api/v1 prefix
 * @returns The full API URL including /api/v1
 */
export function getApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/v1`;
}

/**
 * Build a full API endpoint URL
 * @param endpoint - The endpoint path (e.g., '/products' or 'products')
 * @returns The full URL including base URL and /api/v1
 */
export function buildApiUrl(endpoint: string): string {
  const apiUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiUrl}${cleanEndpoint}`;
}

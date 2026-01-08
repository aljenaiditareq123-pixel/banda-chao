/**
 * API Utility Functions
 * Centralized URL handling to prevent double prefix issues
 */

/**
 * Get the API base URL, ensuring no double /api prefix
 * @returns The base URL for API calls (without /api suffix)
 */
export function getApiBaseUrl(): string {
  // Get environment variable (available in both SSR and client-side)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // CRITICAL: In Render, Frontend and Backend are separate services
  // So we MUST use the external URL even in SSR
  if (typeof window === 'undefined') {
    // Server-side (SSR): Use environment variable or fallback
    // In Render, Frontend and Backend are separate, so we use external URL
    if (envUrl) {
      let baseUrl = envUrl.trim().replace(/\/$/, '');
      // Remove /api if it exists at the end (prevent double prefix)
      baseUrl = baseUrl.replace(/\/api$/, '');
      return baseUrl;
    }
    
    // Fallback: Detect if we're on Render or in production
    // Check multiple ways to detect Render environment
    const isRender = 
      process.env.RENDER === 'true' || 
      !!process.env.RENDER_SERVICE_ID || 
      !!process.env.RENDER_SERVICE_NAME ||
      !!process.env.RENDER_EXTERNAL_URL ||
      (typeof process.env.HOSTNAME === 'string' && process.env.HOSTNAME.includes('render'));
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    // If we're in production OR on Render, use external backend URL
    // This is safer because in Render, Frontend and Backend are always separate
    if (isProduction || isRender) {
      // On Render production, always use external backend URL
      // Default Render backend URL
      return 'https://banda-chao-backend.onrender.com';
    }
    
    // Development: Use localhost (only works if backend runs locally)
    const port = process.env.PORT || '10000';
    return `http://localhost:${port}`;
  }

  // Client-side: Use Next.js proxy in development to bypass CORS
  // The proxy rewrites /api/proxy/* to https://banda-chao.onrender.com/api/*
  if (process.env.NODE_ENV === 'development') {
    return '/api/proxy';
  }

  // In production (client-side), use the environment variable or fallback

  if (!envUrl) {
    // Fallback to main service URL (banda-chao.onrender.com)
    // The main service 'banda-chao' handles both frontend and backend
    const fallbackUrl = 'https://banda-chao.onrender.com';
    return fallbackUrl;
  }

  // Remove trailing slash
  let baseUrl = envUrl.trim().replace(/\/$/, '');

  // Remove /api if it exists at the end (prevent double prefix)
  baseUrl = baseUrl.replace(/\/api$/, '');

  return baseUrl;
}

/**
 * Get the full API URL with /api/v1 prefix
 * @returns The full API URL including /api/v1
 * 
 * CRITICAL: Backend routes are mounted at /api/v1/* (see server/src/index.ts line 410)
 * app.use('/api/v1/auth', authRoutes) → /api/v1/auth/login
 */
export function getApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  
  // In development, baseUrl is already '/api/proxy' (relative path for Next.js proxy)
  // The proxy rewrites /api/proxy/* to https://banda-chao.onrender.com/api/v1/*
  // So we don't need to add anything - proxy handles /v1 automatically
  if (baseUrl.startsWith('/api/proxy')) {
    return baseUrl; // Already correct, don't modify
  }
  
  // For SSR (server-side): baseUrl is '' (empty), so we just return '/api/v1'
  // This makes axios use relative path: /api/v1/products (same server)
  // For client-side: baseUrl is external URL, so we add '/api/v1'
  const fullUrl = baseUrl ? `${baseUrl}/api/v1` : '/api/v1';
  
  // Log for debugging (only in development or for SSR)
  if (process.env.NODE_ENV === 'development' || typeof window === 'undefined') {
    const context = typeof window === 'undefined' ? '[SSR]' : '[CLIENT]';
    console.log(`[API${context}] Full API URL:`, fullUrl, '(baseUrl:', baseUrl || 'empty (relative)', ')');
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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales
const locales = ['ar', 'en', 'zh'];
const defaultLocale = 'ar';

// Country to locale mapping (based on IP geolocation)
const countryToLocale: Record<string, string> = {
  // Arabic countries
  'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'IQ': 'ar', 'JO': 'ar', 'KW': 'ar', 'LB': 'ar', 'LY': 'ar', 'MA': 'ar', 'OM': 'ar', 'QA': 'ar', 'SY': 'ar', 'TN': 'ar', 'YE': 'ar', 'DZ': 'ar', 'BH': 'ar', 'SD': 'ar', 'SO': 'ar',
  // Chinese countries/regions
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh', 'SG': 'zh',
  // Default to English for others
};

// Get locale from IP geolocation
// Uses external Geo-IP service for accurate country detection
// CRITICAL: This function is wrapped in try/catch at call site to NEVER crash the middleware
async function getLocaleFromIP(request: NextRequest): Promise<string> {
  try {
    // Priority 1: Try Cloudflare/Vercel headers (if available)
    const country = request.headers.get('cf-ipcountry') || 
                    request.headers.get('x-vercel-ip-country') ||
                    null;

    if (country && countryToLocale[country]) {
      return countryToLocale[country];
    }

    // Priority 2: Use internal Geo-IP API route (uses geoip-lite)
    // Extract IP from request first
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('cf-connecting-ip') ||
                     null;
    
    if (clientIP) {
      try {
        // Build API URL - use same origin as request
        const url = new URL('/api/geoip', request.url);
        url.searchParams.set('ip', clientIP);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const geoResponse = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            // Forward headers that contain IP information
            'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
            'x-real-ip': request.headers.get('x-real-ip') || '',
            'cf-connecting-ip': request.headers.get('cf-connecting-ip') || '',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData?.country && countryToLocale[geoData.country]) {
            return countryToLocale[geoData.country];
          }
        }
      } catch (error) {
        // Silently fail and fall back to Accept-Language
        // This is expected to fail sometimes (network issues, timeout, etc.)
        // Do not log to avoid noise in production
        if (process.env.NODE_ENV === 'development') {
          console.warn('[GeoIP Middleware] Failed to fetch Geo-IP (non-critical):', error instanceof Error ? error.message : String(error));
        }
      }
    }

    // Priority 3: Fallback to Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      // Check for Arabic
      if (acceptLanguage.includes('ar')) {
        return 'ar';
      }
      // Check for Chinese
      if (acceptLanguage.includes('zh') || acceptLanguage.includes('cn')) {
        return 'zh';
      }
    }

    // Priority 4: Default locale
    return defaultLocale;
  } catch (error) {
    // CRITICAL: This catch ensures the function NEVER throws
    // Always return a valid locale, even if everything fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GeoIP Middleware] Error in getLocaleFromIP (falling back to default):', error instanceof Error ? error.message : String(error));
    }
    return defaultLocale;
  }
}

// Get locale from pathname
async function getLocale(pathname: string, request?: NextRequest): Promise<string> {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Check if first segment is a valid locale
  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment;
  }
  
  // If no locale in path, try to detect from IP
  if (request) {
    return await getLocaleFromIP(request);
  }
  
  return defaultLocale;
}

// Check if pathname has a locale
function hasLocale(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 && locales.includes(segments[0]);
}

// Check if pathname should be excluded from locale routing
function shouldExcludePath(pathname: string): boolean {
  // Normalize pathname for comparison
  const normalizedPath = pathname.toLowerCase().trim();
  
  // Exclude static files, API routes, and special paths
  const excludePatterns = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/og-image.png',
    '/robots.txt',
    '/sitemap.xml',
    '/founder', // Founder pages don't use locale
    '/admin', // Admin pages don't use locale (like /founder)
    '/health', // Health check endpoint - must bypass all middleware for fastest response
  ];
  
  // Check exact matches first (including favicon.ico and robots.txt)
  if (excludePatterns.some(pattern => {
    const normalizedPattern = pattern.toLowerCase();
    return normalizedPath === normalizedPattern || 
           normalizedPath === normalizedPattern.replace(/^\//, '') ||
           normalizedPath.startsWith(normalizedPattern);
  })) {
    return true;
  }
  
  // Exclude file extensions (images, fonts, etc.) - this should catch favicon.ico, robots.txt
  const fileExtensionPattern = /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot|json|xml|txt)$/i;
  if (fileExtensionPattern.test(normalizedPath)) {
    return true;
  }
  
  // Additional check: if pathname contains static file names anywhere, exclude it
  const staticFileNames = ['favicon.ico', 'robots.txt', 'sitemap.xml', 'manifest.json'];
  if (staticFileNames.some(fileName => normalizedPath.includes(fileName))) {
    return true;
  }
  
  // Check if pathname ends with a locale but is actually a static file
  // e.g., /ar/robots.txt or /en/favicon.ico
  const pathSegments = normalizedPath.split('/').filter(Boolean);
  if (pathSegments.length >= 2) {
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (staticFileNames.includes(lastSegment) || fileExtensionPattern.test(lastSegment)) {
      return true;
    }
  }
  
  return false;
}

// Check if pathname is a public route (no auth required)
function isPublicRoute(pathname: string): boolean {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/test-payment', // Test payment page - public
    '/products',
    '/makers',
    '/videos',
    '/posts',
    '/about',
    '/login',
    '/signup',
    '/register',
    '/auth', // NextAuth routes and signin page
    '/privacy-policy',
    '/terms-of-service',
  ];
  
  // Check if pathname starts with any public route (with or without locale)
  return publicRoutes.some(route => {
    // Match exact route or route with locale prefix
    return pathname === route || 
           pathname.startsWith(`/ar${route}`) ||
           pathname.startsWith(`/en${route}`) ||
           pathname.startsWith(`/zh${route}`) ||
           // Match with locale as first segment
           new RegExp(`^/[a-z]{2}${route.replace(/^\//, '')}`).test(pathname);
  });
}

// Check if pathname is a protected route (requires authentication)
function isProtectedRoute(pathname: string): boolean {
  // Protected routes that require authentication
  const protectedRoutes = [
    '/maker', // All maker routes (studio, dashboard, etc.)
    '/profile',
    '/orders',
    '/addresses',
    '/payment',
    '/cart', // Cart requires authentication
    '/checkout', // Checkout requires authentication
  ];
  
  // Check if pathname starts with any protected route (with or without locale)
  return protectedRoutes.some(route => {
    // Match exact route or route with locale prefix
    return pathname === route || 
           pathname.startsWith(`/ar${route}`) ||
           pathname.startsWith(`/en${route}`) ||
           pathname.startsWith(`/zh${route}`) ||
           // Match with locale as first segment
           new RegExp(`^/[a-z]{2}${route.replace(/^\//, '')}`).test(pathname);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL: Health check endpoint - respond immediately without any processing
  // This MUST be the first check to ensure instant response for Render health checks
  // Check both with and without trailing slash, and handle any encoding
  const normalizedPathname = pathname.toLowerCase().trim();
  if (normalizedPathname === '/health' || normalizedPathname === '/health/') {
    // Return response immediately - no async operations, no processing
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  }
  
  // CRITICAL: Skip locale routing for excluded paths (check this FIRST)
  // This is the most important check - do it before anything else
  if (shouldExcludePath(pathname)) {
    return NextResponse.next();
  }
  
  // Additional early check: if pathname looks like a static file, skip immediately
  // This prevents favicon.ico and other static files from being processed as locales
  if (pathname.includes('favicon.ico') || 
      pathname.includes('robots.txt') || 
      pathname.includes('manifest.json') ||
      pathname.includes('og-image.png') ||
      pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot|json|xml|txt)$/i)) {
    return NextResponse.next();
  }

  // Protect /admin routes - require authentication
  if (pathname.startsWith('/admin')) {
    // Check for NextAuth session tokens (primary auth method)
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                         request.cookies.get('__Secure-next-auth.session-token') ||
                         request.cookies.get('__Host-next-auth.session-token');
    
    // Also check for JWT token (legacy auth system)
    const jwtToken = request.cookies.get('auth_token');
    
    // If no session token and no JWT token, redirect to sign-in
    if (!sessionToken && !jwtToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Note: Full role verification (ADMIN/FOUNDER) happens in AdminLayout component
    // This middleware just checks for token presence
    // founder@banda-chao.com email check is handled in NextAuth session callback
  }

  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    // Get locale for redirect (with fail-safe error handling)
    let locale: string;
    try {
      locale = await getLocale(pathname, request);
    } catch (error) {
      // CRITICAL: Fail-safe fallback to default locale if getLocale throws
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Middleware] Error getting locale (using default):', error);
      }
      locale = defaultLocale;
    }
    
    // Check for NextAuth session tokens
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                         request.cookies.get('__Secure-next-auth.session-token') ||
                         request.cookies.get('__Host-next-auth.session-token');
    
    // Also check for JWT token (legacy auth system)
    const jwtToken = request.cookies.get('auth_token');
    
    // If no session token, redirect to sign-in
    if (!sessionToken && !jwtToken) {
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Additional check: if pathname is a static file, skip locale routing
  // This catches cases where static files might slip through
  const normalizedPath = pathname.toLowerCase().trim();
  
  // Check for common static file patterns
  if (
    normalizedPath === 'favicon.ico' ||
    normalizedPath === '/favicon.ico' ||
    normalizedPath.endsWith('/favicon.ico') ||
    normalizedPath === 'robots.txt' ||
    normalizedPath === '/robots.txt' ||
    normalizedPath.endsWith('/robots.txt') ||
    normalizedPath.includes('.ico') || 
    normalizedPath.includes('.png') || 
    normalizedPath.includes('.jpg') || 
    normalizedPath.includes('.svg') ||
    normalizedPath.includes('.txt') ||
    normalizedPath.includes('.xml') ||
    normalizedPath.includes('.json') ||
    normalizedPath.includes('.woff') ||
    normalizedPath.includes('.woff2') ||
    normalizedPath.includes('.ttf') ||
    normalizedPath.includes('.eot')
  ) {
    return NextResponse.next();
  }
  
  // Check if pathname already has a locale
  const pathnameHasLocale = hasLocale(pathname);
  
  // If pathname doesn't have a locale, detect from IP and redirect
  if (!pathnameHasLocale) {
    let detectedLocale: string;
    try {
      detectedLocale = await getLocale(pathname, request);
    } catch (error) {
      // CRITICAL: Fail-safe fallback to default locale if getLocale throws
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Middleware] Error detecting locale (using default):', error);
      }
      detectedLocale = defaultLocale;
    }
    const newUrl = new URL(`/${detectedLocale}${pathname === '/' ? '' : pathname}`, request.url);
    
    // Preserve query parameters
    newUrl.search = request.nextUrl.search;
    
    // Use 307 (Temporary Redirect) instead of 302 for better SEO
    return NextResponse.redirect(newUrl, 307);
  }
  
  // If pathname has a locale, validate it and continue
  let locale: string;
  try {
    locale = await getLocale(pathname);
  } catch (error) {
    // CRITICAL: Fail-safe fallback to default locale if getLocale throws
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Middleware] Error getting locale from pathname (using default):', error);
    }
    locale = defaultLocale;
  }
  if (!locales.includes(locale)) {
    // Invalid locale, redirect to default locale
    const newUrl = new URL(`/${defaultLocale}${pathname.replace(`/${locale}`, '')}`, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl, 307);
  }
  
  // Valid locale in path, continue to Next.js
  return NextResponse.next();
}

// Configure which paths should be processed by middleware
// CRITICAL: This matcher MUST exclude /api routes to prevent breaking NextAuth
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (CRITICAL: /api/* must be excluded for NextAuth to work)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml, etc.
     * - static files (images, fonts, etc.)
     */
    '/((?!api|_next|.*\\..*).*)',
  ],
};


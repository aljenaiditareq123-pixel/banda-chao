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

// Get locale from IP geolocation (using Cloudflare headers or similar)
function getLocaleFromIP(request: NextRequest): string {
  // Try to get country from Cloudflare CF-IPCountry header
  // Note: request.geo is deprecated in Next.js 16, using headers only
  const country = request.headers.get('cf-ipcountry') || 
                  request.headers.get('x-vercel-ip-country') ||
                  null;

  if (country && countryToLocale[country]) {
    return countryToLocale[country];
  }

  // Fallback: try to detect from Accept-Language header
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

  return defaultLocale;
}

// Get locale from pathname
function getLocale(pathname: string, request?: NextRequest): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Check if first segment is a valid locale
  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment;
  }
  
  // If no locale in path, try to detect from IP
  if (request) {
    return getLocaleFromIP(request);
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
  ];
  
  return excludePatterns.some(pattern => pathname.startsWith(pattern));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip locale routing for excluded paths
  if (shouldExcludePath(pathname)) {
    return NextResponse.next();
  }
  
  // Check if pathname already has a locale
  const pathnameHasLocale = hasLocale(pathname);
  
  // If pathname doesn't have a locale, detect from IP and redirect
  if (!pathnameHasLocale) {
    const detectedLocale = getLocale(pathname, request);
    const newUrl = new URL(`/${detectedLocale}${pathname === '/' ? '' : pathname}`, request.url);
    
    // Preserve query parameters
    newUrl.search = request.nextUrl.search;
    
    // Use 307 (Temporary Redirect) instead of 302 for better SEO
    return NextResponse.redirect(newUrl, 307);
  }
  
  // If pathname has a locale, validate it and continue
  const locale = getLocale(pathname);
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
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml, etc.
     * - static files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|og-image.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
};


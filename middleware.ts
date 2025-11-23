import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for Banda Chao
 * 
 * Handles:
 * - Automatic locale detection based on GEO and user preference
 * - Founder page redirects (always Arabic-only)
 * - Cookie-based locale preference (overrides GEO)
 * - SEO-friendly (doesn't block crawlers)
 */

// Country to locale mapping
const COUNTRY_TO_LOCALE: Record<string, 'ar' | 'zh' | 'en'> = {
  // China → Chinese
  'CN': 'zh',
  
  // Arab countries → Arabic
  'AE': 'ar', // UAE
  'SA': 'ar', // Saudi Arabia
  'KW': 'ar', // Kuwait
  'BH': 'ar', // Bahrain
  'QA': 'ar', // Qatar
  'OM': 'ar', // Oman
  'EG': 'ar', // Egypt
  'JO': 'ar', // Jordan
  'LB': 'ar', // Lebanon
  'SY': 'ar', // Syria
  'IQ': 'ar', // Iraq
  'YE': 'ar', // Yemen
  'LY': 'ar', // Libya
  'TN': 'ar', // Tunisia
  'DZ': 'ar', // Algeria
  'MA': 'ar', // Morocco
  'SD': 'ar', // Sudan
  'SO': 'ar', // Somalia
  'DJ': 'ar', // Djibouti
  'MR': 'ar', // Mauritania
  
  // Default to English for all other countries
};

// Supported locales
const SUPPORTED_LOCALES = ['ar', 'zh', 'en'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Cookie name for preferred locale
const PREFERRED_LOCALE_COOKIE = 'preferredLocale';

/**
 * Check if a user agent is a Chinese search engine crawler (Baidu, Sogou, 360)
 */
function isChineseCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /Baiduspider|Sogou|360Spider|YisouSpider/i.test(userAgent);
}

/**
 * Check if a user agent is a bot/crawler
 */
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /googlebot/i,
    /bingbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /duckduckbot/i,
    /slurp/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /rogerbot/i,
    /linkedinbot/i,
    /embedly/i,
    /quora link preview/i,
    /showyoubot/i,
    /outbrain/i,
    /pinterest/i,
    /slackbot/i,
    /vkShare/i,
    /W3C_Validator/i,
    /whatsapp/i,
    /flipboard/i,
    /tumblr/i,
    /bitlybot/i,
    /skypeuripreview/i,
    /nuzzel/i,
    /redditbot/i,
    /applebot/i,
    /yahoo/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /http/i,
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Get locale from cookie
 */
function getLocaleFromCookie(request: NextRequest): Locale | null {
  const cookieValue = request.cookies.get(PREFERRED_LOCALE_COOKIE)?.value;
  if (cookieValue === 'ar' || cookieValue === 'zh' || cookieValue === 'en') {
    return cookieValue;
  }
  return null;
}

/**
 * Get locale from GEO (country code)
 */
function getLocaleFromGeo(request: NextRequest): Locale {
  const country = request.geo?.country;
  if (country && country in COUNTRY_TO_LOCALE) {
    return COUNTRY_TO_LOCALE[country];
  }
  return 'en'; // Default to English
}

/**
 * Extract locale from pathname
 */
function getLocaleFromPath(pathname: string): Locale | null {
  const match = pathname.match(/^\/(ar|zh|en)(\/|$)/);
  if (match && match[1]) {
    return match[1] as Locale;
  }
  return null;
}

/**
 * Check if path is a founder page
 */
function isFounderPath(pathname: string): boolean {
  return pathname.startsWith('/founder') || pathname.match(/^\/(ar|zh|en)\/founder/) !== null;
}

/**
 * Check if path should skip middleware
 */
function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/sw.js') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent');
  const isCrawler = isBot(userAgent);
  const isChineseCrawlerBot = isChineseCrawler(userAgent);
  
  // Skip middleware for API routes, static assets, etc.
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Special handling for Chinese search engine crawlers (Baidu, Sogou, 360)
  // Allow them to access /zh directly without redirects
  if (isChineseCrawlerBot) {
    // If accessing root, redirect to /zh
    if (pathname === '/') {
      const redirectUrl = new URL('/zh', request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl);
    }
    // If already on /zh or any /zh/* path, allow access
    if (pathname.startsWith('/zh')) {
      return NextResponse.next();
    }
    // For any other path, redirect to /zh equivalent if exists
    // Otherwise, allow pass-through
    return NextResponse.next();
  }

  // Handle founder pages: Always redirect to Arabic-only /founder
  if (isFounderPath(pathname)) {
    // If path is like /en/founder or /zh/founder, redirect to /founder
    if (pathname.match(/^\/(en|zh|ar)\/founder/)) {
      const newPath = pathname.replace(/^\/(en|zh|ar)\/founder/, '/founder');
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    // If already at /founder, pass through
    if (pathname.startsWith('/founder')) {
      return NextResponse.next();
    }
  }

  // Get current locale from pathname (if any)
  const currentLocale = getLocaleFromPath(pathname);
  
  // If user is already at a valid locale path, check if we need to redirect
  if (currentLocale) {
    // Don't redirect crawlers - let them access any locale
    if (isCrawler) {
      return NextResponse.next();
    }
    
    // Special handling: product detail pages (/locale/products/[productId])
    // Always allow these to pass through without redirect - they should work for all locales
    if (pathname.match(/^\/(ar|zh|en)\/products\/[^\/]+$/)) {
      return NextResponse.next();
    }
    
    // Check cookie preference
    const cookieLocale = getLocaleFromCookie(request);
    
    // If cookie exists and doesn't match current locale, redirect
    // BUT: Allow manual override if they're already on a locale page
    // (user might have manually navigated)
    // Only redirect from root to preferred locale
    if (cookieLocale && cookieLocale !== currentLocale && pathname === `/${currentLocale}`) {
      // User is on root locale page, redirect to cookie preference
      const redirectUrl = new URL(`/${cookieLocale}`, request.url);
      redirectUrl.search = request.nextUrl.search; // Preserve query params
      return NextResponse.redirect(redirectUrl);
    }
    
    // Already on valid locale, pass through
    return NextResponse.next();
  }

  // User is at root path (/) - determine locale and redirect
  
  // Don't redirect crawlers from root - let them access default behavior
  // But we should still provide a default locale for SEO
  if (isCrawler) {
    // For crawlers, redirect to /en as default (or let them access /en directly)
    // Actually, better to not redirect bots at all - let them access / directly
    // But we need a locale page... So redirect to /en for SEO
    const redirectUrl = new URL('/en', request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // Priority 1: Check cookie preference
  const cookieLocale = getLocaleFromCookie(request);
  if (cookieLocale) {
    const redirectUrl = new URL(`/${cookieLocale}`, request.url);
    redirectUrl.search = request.nextUrl.search; // Preserve query params
    return NextResponse.redirect(redirectUrl);
  }

  // Priority 2: Use GEO detection
  const geoLocale = getLocaleFromGeo(request);
  const redirectUrl = new URL(`/${geoLocale}`, request.url);
  redirectUrl.search = request.nextUrl.search; // Preserve query params
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api (API routes - already handled in shouldSkipMiddleware)
     * - Image/font files (already handled in shouldSkipMiddleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}

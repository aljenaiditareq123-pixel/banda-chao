import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for Banda Chao
 * 
 * Currently handles:
 * - Route exclusions (founder, api, static assets)
 * - Locale detection (if needed in future)
 * 
 * JWT authentication is handled client-side via AuthContext
 * and on the backend via Express middleware (authenticateToken)
 * 
 * Future enhancements:
 * - Role-based route protection (FOUNDER / MAKER / USER)
 * - JWT token refresh if needed
 * - Rate limiting
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - Founder pages (no auth needed)
  // - API routes (handled by Next.js API routes or Express backend)
  // - Static assets (_next/static, _next/image, favicon, images)
  if (
    pathname.startsWith('/founder') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // For now, just pass through all requests
  // JWT authentication is handled:
  // - Client-side: AuthContext checks localStorage for 'auth_token'
  // - Backend: Express middleware verifies JWT in Authorization header
  // 
  // Future: Add role-based access control here if needed
  // Example:
  // const token = request.cookies.get('auth_token')?.value;
  // if (pathname.startsWith('/maker/dashboard') && !hasMakerRole(token)) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /founder (founder pages - no auth needed)
     * - /api (API routes)
     * - Image files (svg, png, jpg, jpeg, gif, webp, ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|founder|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

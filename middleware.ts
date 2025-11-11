import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const allowedOrigins = new Set<string>([
  'http://localhost:3000',
  'https://bandachao.com',
  'https://www.bandachao.com',
]);

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

const applySecurityHeaders = (response: NextResponse) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

const applyCorsHeaders = (response: NextResponse, origin: string | null) => {
  if (!origin) {
    return response;
  }

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
};

type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/founder-dashboard')) {
    const openResponse = NextResponse.next();
    return applySecurityHeaders(openResponse);
  }

  const isApiRequest = pathname.startsWith('/api/');
  const origin = request.headers.get('origin');

  if (isApiRequest && origin && !allowedOrigins.has(origin)) {
    return new NextResponse('CORS origin forbidden', { status: 403 });
  }

  if (isApiRequest && request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 });
    if (origin && allowedOrigins.has(origin)) {
      applyCorsHeaders(preflightResponse, origin);
    }
    preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    preflightResponse.headers.set('Access-Control-Max-Age', '86400');
    return applySecurityHeaders(preflightResponse);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        },
        remove(name: string, options?: CookieOptions) {
          request.cookies.set(name, '');
          response = NextResponse.next({ request });
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    },
  );

  await supabase.auth.getUser();

  if (isApiRequest && origin && allowedOrigins.has(origin)) {
    applyCorsHeaders(response, origin);
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

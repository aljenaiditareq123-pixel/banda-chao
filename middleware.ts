import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'; // Use Node.js runtime instead of Edge

export async function middleware(request: NextRequest) {
  // Skip Supabase auth for founder pages and API routes
  if (request.nextUrl.pathname.startsWith('/founder') || request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if Supabase environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // If Supabase is not configured, skip middleware
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            request.cookies.set(name, '')
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    // Refreshing the auth token
    await supabase.auth.getUser()
  } catch (error) {
    // If Supabase fails, continue without auth
    console.error('[Middleware] Supabase error:', error);
  }

  return supabaseResponse
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|founder|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

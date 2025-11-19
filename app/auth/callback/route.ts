import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

// Get API base URL - NEXT_PUBLIC_API_URL already includes /api/v1
const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'https://banda-chao-backend.onrender.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export async function GET(request: Request) {
  let origin: string;
  try {
    const url = new URL(request.url);
    origin = url.origin;
    const searchParams = url.searchParams;
    const code = searchParams.get('code');
    const provider = searchParams.get('provider') || 'google';
    const next = searchParams.get('next') ?? '/';

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=missing_code`);
    }

    // Call Express API OAuth callback
    try {
      const response = await axios.post(`${API_BASE_URL}/oauth/${provider}/callback`, {
        code
      });

      const { user, token } = response.data;

      // Store token in cookie for server-side access (7 days expiry)
      const redirectUrl = new URL(`${origin}/auth/callback-handler`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('next', next);
      
      const responseWithCookie = NextResponse.redirect(redirectUrl.toString());
      responseWithCookie.cookies.set('auth_token', token, {
        httpOnly: false, // Allow client-side access for backward compatibility
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return responseWithCookie;
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=oauth_failed&message=${encodeURIComponent(error.response?.data?.error || 'OAuth failed')}`);
    }
  } catch (error: any) {
    console.error('Callback route error:', error);
    // Fallback origin if URL parsing fails
    const fallbackOrigin = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 
                          process.env.FRONTEND_URL || 
                          'https://banda-chao.vercel.app';
    return NextResponse.redirect(`${fallbackOrigin}/login?error=callback_error`);
  }
}

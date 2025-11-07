import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'https://banda-chao-backend.onrender.com/api/v1';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
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

      // Store token in cookie or localStorage (via redirect to client-side handler)
      // For now, redirect to a client-side page that will handle token storage
      const redirectUrl = new URL(`${origin}/auth/callback-handler`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('next', next);
      
      return NextResponse.redirect(redirectUrl.toString());
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=oauth_failed&message=${encodeURIComponent(error.response?.data?.error || 'OAuth failed')}`);
    }
  } catch (error: any) {
    console.error('Callback route error:', error);
    return NextResponse.redirect(`${origin}/login?error=callback_error`);
  }
}

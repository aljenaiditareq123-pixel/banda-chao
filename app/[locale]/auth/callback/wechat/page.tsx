'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function WeChatCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ar';

  useEffect(() => {
    const code = searchParams?.get('code');
    const state = searchParams?.get('state');

    if (!code) {
      router.push(`/${locale}/auth/signin?error=WeChatAuthFailed`);
      return;
    }

    // Parse state to get callbackUrl
    let callbackUrl = `/${locale}`;
    try {
      if (state) {
        const parsedState = JSON.parse(decodeURIComponent(state));
        callbackUrl = parsedState.callbackUrl || callbackUrl;
      }
    } catch (e) {
      // Invalid state, use default
    }

    // Sign in with WeChat credentials
    signIn('wechat', {
      code,
      callbackUrl,
      redirect: true,
    }).catch((err) => {
      console.error('WeChat sign-in error:', err);
      router.push(`/${locale}/auth/signin?error=WeChatAuthFailed`);
    });
  }, [searchParams, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-gray-600">Processing WeChat authentication...</p>
      </div>
    </div>
  );
}

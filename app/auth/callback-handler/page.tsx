'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

export const dynamic = 'force-dynamic';

function CallbackHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const next = searchParams.get('next') || '/';

    if (token) {
      // Store token in localStorage for client-side access
      localStorage.setItem('auth_token', token);
      
      // Also set cookie for server-side access (7 days expiry)
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}samesite=lax`;

      // Fetch user info using centralized API helper with retry logic
      const apiBaseUrl = getApiBaseUrl();
      fetchJsonWithRetry(`${apiBaseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        maxRetries: 2,
        retryDelay: 1000,
      })
        .then(data => {
          const userData = data.user || data;
          if (userData && !userData.error) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              profilePicture: userData.profilePicture,
              role: userData.role || 'USER', // Default to 'USER' if role is missing
              createdAt: userData.createdAt,
            });
            router.push(next);
          } else {
            throw new Error(userData.error || 'Failed to fetch user data');
          }
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
          router.push('/login?error=user_fetch_failed');
        });
    } else {
      router.push('/login?error=missing_token');
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">正在处理登录...</p>
        <p className="text-gray-500 text-sm mt-2">Processing login...</p>
      </div>
    </div>
  );
}

export default function CallbackHandlerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">正在加载...</p>
        </div>
      </div>
    }>
      <CallbackHandlerContent />
    </Suspense>
  );
}



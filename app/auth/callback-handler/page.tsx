'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

function CallbackHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const next = searchParams.get('next') || '/';

    if (token) {
      // Store token
      localStorage.setItem('auth_token', token);

      // Fetch user info
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com'}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const userData = data.user || data;
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              profilePicture: userData.profilePicture,
              role: userData.role || 'USER', // Default to 'USER' if role is missing
              createdAt: userData.createdAt,
            });
          }
          router.push(next);
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



'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional locale for redirect URL
   * If not provided, will try to extract from pathname (e.g., /ar/checkout -> /ar/login)
   */
  locale?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes by checking if user is authenticated.
 * If not authenticated, redirects to login page with redirect parameter.
 * 
 * Supports locale-aware redirects:
 * - /ar/checkout -> /ar/login?redirect=/ar/checkout
 * - /en/checkout -> /en/login?redirect=/en/checkout
 * - /checkout -> /login?redirect=/checkout
 */
export default function ProtectedRoute({ children, locale }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Extract locale from pathname if not provided
      const detectedLocale = locale || pathname?.split('/')[1] || 'en';
      const isValidLocale = ['ar', 'en', 'zh'].includes(detectedLocale);
      const finalLocale = isValidLocale ? detectedLocale : 'en';
      
      // Build redirect URL with current path
      const currentPath = pathname || '/';
      const redirectUrl = `${isValidLocale ? `/${finalLocale}` : ''}/login?redirect=${encodeURIComponent(currentPath)}`;
      
      router.push(redirectUrl);
    }
  }, [user, loading, router, locale, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}



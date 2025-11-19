'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FounderRouteProps {
  children: React.ReactNode;
  /**
   * Optional locale for redirect URL (defaults to 'en')
   * Used for redirecting non-founders to home page
   */
  locale?: string;
}

/**
 * FounderRoute Component
 * 
 * Protects routes by checking if user is authenticated AND has FOUNDER role.
 * 
 * Behavior:
 * 1. If user is not authenticated:
 *    - Redirects to /[locale]/login?redirect=/founder
 * 
 * 2. If user is authenticated but NOT a FOUNDER:
 *    - Redirects to /[locale] (home page)
 *    - TODO: Could show a message "This page is only for the founder" instead
 * 
 * 3. If user is authenticated AND is FOUNDER:
 *    - Allows access to the route
 * 
 * Note: This component relies on AuthContext which gets user data from:
 * - /api/v1/users/me endpoint
 * - User object must have role: 'FOUNDER' to allow access
 * 
 * TODO: Currently, FOUNDER role is determined by:
 * - Backend: user.role === 'FOUNDER' in database
 * - Backend: OR user.email matches FOUNDER_EMAIL environment variable
 * 
 * Future: Consider adding role-based permission system if needed.
 */
export default function FounderRoute({ children, locale = 'en' }: FounderRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth state to finish loading
    if (loading) {
      return;
    }

    // Case 1: User is not authenticated
    if (!user) {
      const currentPath = pathname || '/founder';
      const redirectUrl = `/${locale}/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
      return;
    }

    // Case 2: User is authenticated but NOT a FOUNDER
    if (user.role !== 'FOUNDER') {
      // Redirect non-founders to home page
      router.push(`/${locale}`);
      return;
    }

    // Case 3: User is authenticated AND is FOUNDER
    // Allow access (no redirect needed)
  }, [user, loading, router, locale, pathname]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user || user.role !== 'FOUNDER') {
    return null; // Will redirect via useEffect
  }

  // User is authenticated and is FOUNDER - render children
  return <>{children}</>;
}


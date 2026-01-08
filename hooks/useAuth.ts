'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usersAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'FOUNDER' | 'MAKER' | 'BUYER' | 'ADMIN' | 'USER';
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to get current authenticated user
 * Uses centralized API client with retry logic
 * Also syncs with NextAuth session for Google OAuth
 * 
 * CRITICAL: This hook ALWAYS returns a valid object structure.
 * Never returns undefined, even in error cases or during SSR.
 */
export function useAuth(): UseAuthReturn {
  // Initialize with safe defaults
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Safely handle useSession - it can be undefined during static build
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const sessionStatus = sessionResult?.status || 'unauthenticated';

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('bandaChao_user');
      
      // If we have stored user data, use it immediately (optimistic)
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          // Invalid JSON, continue to API call
        }
      }
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Use centralized API client with retry logic to get fresh user data
      try {
        const data = await usersAPI.getMe();
        const userData = data.user || data;
        setUser(userData);
        
        // Update localStorage with fresh data
        if (userData) {
          localStorage.setItem('bandaChao_user', JSON.stringify(userData));
          localStorage.setItem('bandaChao_userRole', userData.role || 'BUYER');
          localStorage.setItem('bandaChao_userEmail', userData.email || '');
          localStorage.setItem('bandaChao_userName', userData.name || '');
          if (userData.image) {
            localStorage.setItem('bandaChao_userImage', userData.image);
          }
        }
      } catch (apiErr: unknown) {
        // If API call fails but we have stored user, keep using it
        if (storedUser) {
          // Already set above, just log the error
          if (process.env.NODE_ENV === 'development') {
            const errorMessage = apiErr && typeof apiErr === 'object' && 'message' in apiErr
              ? (apiErr as { message?: string }).message
              : 'Unknown error';
            console.warn('[useAuth] API call failed, using stored user data:', errorMessage);
          }
        } else {
          // No stored user and API failed - clear everything
          const axiosError = apiErr as { response?: { status?: number } };
          if (axiosError?.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('bandaChao_isLoggedIn');
            localStorage.removeItem('bandaChao_user');
            localStorage.removeItem('bandaChao_userRole');
            localStorage.removeItem('bandaChao_userEmail');
            localStorage.removeItem('bandaChao_userName');
            setUser(null);
          } else {
            const errorMessage = apiErr instanceof Error ? apiErr.message : 'حدث خطأ أثناء جلب بيانات المستخدم';
            setError(errorMessage);
            setUser(null);
          }
        }
      }
    } catch (err: unknown) {
      console.error('[useAuth] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sync with NextAuth session (for Google OAuth)
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setLoading(true);
      return;
    }

    if (sessionStatus === 'authenticated' && session?.user) {
      // User is authenticated via NextAuth (e.g., Google OAuth)
      const nextAuthUser: User = {
        id: (session.user as any).id || session.user.email || '',
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image || undefined,
        role: (session.user as any).role || 'BUYER',
      };

      setUser(nextAuthUser);
      setLoading(false);

      // Store in localStorage for compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('bandaChao_user', JSON.stringify(nextAuthUser));
        localStorage.setItem('bandaChao_userRole', nextAuthUser.role);
        localStorage.setItem('bandaChao_userEmail', nextAuthUser.email);
        localStorage.setItem('bandaChao_userName', nextAuthUser.name);
        localStorage.setItem('bandaChao_isLoggedIn', 'true');
        
        // Store token if available
        if ((session as any).accessToken) {
          localStorage.setItem('auth_token', (session as any).accessToken);
        }

        // Trigger custom event for other components
        window.dispatchEvent(new Event('authStateChanged'));
      }
    } else if (sessionStatus === 'unauthenticated') {
      // Not authenticated via NextAuth, try regular auth
      fetchUser();
    }
  }, [session, sessionStatus]);

  useEffect(() => {
    // Only fetch in browser (not during SSR/build)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Only fetch if not authenticated via NextAuth
    if (sessionStatus !== 'authenticated') {
      fetchUser();
    }

    // Listen for auth state changes (e.g., after login)
    const handleAuthStateChange = () => {
      if (sessionStatus !== 'authenticated') {
        fetchUser();
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    window.addEventListener('storage', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      window.removeEventListener('storage', handleAuthStateChange);
    };
  }, [sessionStatus]);

  // CRITICAL: Always return a valid object structure, never undefined
  // This prevents "Cannot destructure property" errors
  // Multiple safety layers to ensure we NEVER return undefined
  
  // Safety layer 1: Ensure all values are defined
  const safeUser = user || null;
  const safeLoading = typeof loading === 'boolean' ? loading : true;
  const safeError = error || null;
  
  // Safety layer 2: Wrap in try-catch as final safety net
  try {
    const result = {
      user: safeUser,
      loading: safeLoading,
      error: safeError,
    };
    // Safety layer 3: Verify the result is an object
    if (result && typeof result === 'object') {
      return result;
    }
    throw new Error('Result is not an object');
  } catch (err) {
    // Ultimate fallback - return safe defaults if anything goes wrong
    console.error('[useAuth] Critical error in return statement:', err);
    return {
      user: null,
      loading: false,
      error: 'An unexpected error occurred',
    };
  }
}

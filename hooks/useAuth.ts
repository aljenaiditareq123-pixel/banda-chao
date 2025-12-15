'use client';

import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
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
 * 
 * CRITICAL: This hook ALWAYS returns a valid object structure.
 * Never returns undefined, even in error cases or during SSR.
 */
export function useAuth(): UseAuthReturn {
  // Initialize with safe defaults
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    // Only fetch in browser (not during SSR/build)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    fetchUser();

    // Listen for auth state changes (e.g., after login)
    const handleAuthStateChange = () => {
      fetchUser();
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    window.addEventListener('storage', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      window.removeEventListener('storage', handleAuthStateChange);
    };
  }, []);

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

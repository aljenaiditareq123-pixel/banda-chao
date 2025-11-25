'use client';

import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'FOUNDER' | 'MAKER' | 'USER';
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to get current authenticated user
 * Uses centralized API client with retry logic
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Use centralized API client with retry logic
        const data = await usersAPI.getMe();
        setUser(data.user || data);
      } catch (err: any) {
        // If 401, user is not authenticated - clear token and user
        if (err?.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          setUser(null);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب بيانات المستخدم';
          setError(errorMessage);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}

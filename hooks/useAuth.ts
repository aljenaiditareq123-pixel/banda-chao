'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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
 * Checks localStorage for JWT token and fetches user info from backend
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

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com';
        const response = await axios.get<{ user: User }>(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setUser(response.data.user || response.data);
      } catch (err) {
        // If 401, user is not authenticated - clear token and user
        if (axios.isAxiosError(err) && err.response?.status === 401) {
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



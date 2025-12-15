'use client';

import { useState, useEffect } from 'react';
import { FounderKPIs } from '@/types/founder';
import { founderAPI } from '@/lib/api';

interface UseFounderKpisReturn {
  kpis: FounderKPIs | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch Founder KPIs from the backend
 * Uses centralized API client with retry logic
 * 
 * CRITICAL: This hook ALWAYS returns a valid object structure.
 * Never returns undefined, even in error cases or during SSR.
 */
export function useFounderKpis(): UseFounderKpisReturn {
  // Initialize with safe defaults
  const [kpis, setKpis] = useState<FounderKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        console.warn('[useFounderKpis] No authentication token found');
        setError('يرجى تسجيل الدخول أولاً');
        setKpis(null);
        setLoading(false);
        return;
      }

      // Use centralized API client with retry logic
      console.log('[useFounderKpis] Fetching KPIs...');
      const data = await founderAPI.getKPIs();
      console.log('[useFounderKpis] KPIs fetched successfully:', data);
      setKpis(data);
    } catch (err: any) {
      console.error('[useFounderKpis] Error fetching KPIs:', {
        message: err?.message,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
      });
      
      let errorMessage = 'حدث خطأ أثناء جلب البيانات';
      
      if (err?.response?.status === 401) {
        errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      } else if (err?.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحيات للوصول إلى هذه الصفحة';
      } else if (err?.response?.status === 500) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setKpis(null);
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
    fetchKpis();
  }, []);

  // CRITICAL: Always return a valid object structure, never undefined
  // This prevents "Cannot destructure property" errors
  // Wrap in try-catch as final safety net
  try {
    return {
      kpis: kpis || null,
      loading: typeof loading === 'boolean' ? loading : true,
      error: error || null,
      refetch: fetchKpis,
    };
  } catch (err) {
    // Ultimate fallback - return safe defaults if anything goes wrong
    console.error('[useFounderKpis] Critical error in return statement:', err);
    return {
      kpis: null,
      loading: false,
      error: 'An unexpected error occurred',
      refetch: async () => {},
    };
  }
}

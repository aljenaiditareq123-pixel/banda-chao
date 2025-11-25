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
 */
export function useFounderKpis(): UseFounderKpisReturn {
  const [kpis, setKpis] = useState<FounderKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use centralized API client with retry logic
      const data = await founderAPI.getKPIs();
      setKpis(data);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات';
      setError(errorMessage);
      setKpis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  return {
    kpis,
    loading,
    error,
    refetch: fetchKpis,
  };
}

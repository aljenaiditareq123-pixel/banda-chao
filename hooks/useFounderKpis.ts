'use client';

import { useState, useEffect } from 'react';
import { FounderKPIs } from '@/types/founder';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api/v1/founder/kpis`;

interface UseFounderKpisReturn {
  kpis: FounderKPIs | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch Founder KPIs from the backend
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

      const response = await axios.get<FounderKPIs>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setKpis(response.data);
    } catch (err) {
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



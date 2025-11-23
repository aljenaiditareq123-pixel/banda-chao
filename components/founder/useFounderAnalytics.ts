'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

export interface FounderAnalytics {
  summary: {
    totalUsers: number;
    totalMakers: number;
    totalProducts: number;
    totalVideos: number;
    totalPosts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  orders?: {
    byStatus: {
      PENDING: number;
      PAID: number;
      PROCESSING: number;
      SHIPPED: number;
      DELIVERED: number;
      CANCELLED: number;
      FAILED: number;
    };
  };
  topMakers?: Array<{
    id: string;
    name: string;
    userId: string;
    productCount: number;
  }>;
}

/**
 * Hook to fetch founder analytics data
 */
export function useFounderAnalytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<FounderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiBaseUrl = getApiBaseUrl();
        const analyticsJson = await fetchJsonWithRetry(
          `${apiBaseUrl}/founder/analytics`,
          {
            maxRetries: 2,
            retryDelay: 1000,
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setAnalytics(analyticsJson as FounderAnalytics);
      } catch (err: any) {
        console.error('[useFounderAnalytics] Error:', err);
        setError(err);
        // Set empty analytics on error
        setAnalytics({
          summary: {
            totalUsers: 0,
            totalMakers: 0,
            totalProducts: 0,
            totalVideos: 0,
            totalPosts: 0,
            totalOrders: 0,
            totalRevenue: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  return { analytics, loading, error };
}


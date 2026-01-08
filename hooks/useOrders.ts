'use client';

import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '@/lib/api';

export interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  totalAmount: number;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    name: string | null;
    email: string;
  };
  order_items?: Array<{
    id: string;
    quantity: number;
    price: number;
    products?: {
      id: string;
      name: string;
      price: number | null;
    };
  }>;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    paid: number;
  };
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage orders from the API
 * Now restored to fetch real data from the database
 * SSR-safe: Returns consistent initial state to prevent hydration mismatches
 */
export function useOrders(statusFilter?: string): UseOrdersReturn {
  // Initialize with SSR-safe defaults (loading: false during SSR to match initial client render)
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Start as false to match SSR
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, paid: 0 });

  const fetchOrders = useCallback(async () => {
    // Don't fetch if not mounted (SSR safety)
    if (!mounted) return;

    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        console.warn('[useOrders] No authentication token found');
        setError('يرجى تسجيل الدخول أولاً');
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch orders - API supports status filter via query params
      console.log('[useOrders] Fetching orders...', { statusFilter });
      
      // Note: ordersAPI.getAll() doesn't support params yet, so we'll filter client-side
      // In the future, we can update the API to support status filter
      const data = await ordersAPI.getAll();
      console.log('[useOrders] Orders fetched successfully:', data);

      // Filter orders by status if needed (client-side filtering)
      let filteredOrders = data.orders || [];
      if (statusFilter && statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter((order: Order) => order.status === statusFilter);
      }

      setOrders(filteredOrders);
      setStats(data.stats || { total: 0, paid: 0 });
    } catch (err: any) {
      console.error('[useOrders] Error fetching orders:', {
        message: err?.message,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
      });
      
      let errorMessage = 'حدث خطأ أثناء جلب الطلبات';
      
      if (err?.response?.status === 401) {
        errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
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
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, mounted]);

  // Set mounted flag and fetch orders only after client-side mount
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    setMounted(true);
  }, []);

  // Fetch orders after mount
  useEffect(() => {
    if (mounted) {
      fetchOrders();
    }
  }, [mounted, fetchOrders]);

  // CRITICAL: Always return a valid object structure, never undefined
  // This prevents "Cannot destructure property" errors
  // Multiple safety layers to ensure we NEVER return undefined
  
  // Safety layer 1: Ensure all values are defined
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeLoading = typeof loading === 'boolean' ? loading : false; // SSR-safe: default to false
  const safeError = error || null;
  const safeStats = stats && typeof stats === 'object' && 'total' in stats && 'paid' in stats 
    ? stats 
    : { total: 0, paid: 0 };
  const safeRefetch = typeof fetchOrders === 'function' ? fetchOrders : (async () => {});
  
  // Safety layer 2: Wrap in try-catch as final safety net
  try {
    const result = {
      orders: safeOrders,
      loading: safeLoading,
      error: safeError,
      stats: safeStats,
      refetch: safeRefetch,
    };
    // Safety layer 3: Verify the result is an object
    if (result && typeof result === 'object') {
      return result;
    }
    throw new Error('Result is not an object');
  } catch (err) {
    // Ultimate fallback - return safe defaults if anything goes wrong
    console.error('[useOrders] Critical error in return statement:', err);
    return {
      orders: [],
      loading: false,
      error: 'An unexpected error occurred',
      stats: { total: 0, paid: 0 },
      refetch: async () => {},
    };
  }
}


'use client';

import { useState, useEffect } from 'react';
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
 * Custom hook to fetch orders from the backend
 * Requires FOUNDER or ADMIN role
 */
export function useOrders(statusFilter?: string): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, paid: 0 });

  const fetchOrders = async () => {
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
  };

  useEffect(() => {
    // Only fetch in browser (not during SSR/build)
    if (typeof window === 'undefined') {
      return;
    }
    fetchOrders();
  }, [statusFilter]);

  return {
    orders,
    loading,
    error,
    stats,
    refetch: fetchOrders,
  };
}


'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardStats {
  users: number;
  makers: number;
  products: number;
  videos: number;
  orders?: number;
}

/**
 * Founder Sidebar - Stats and Quick Links
 * 
 * Displays:
 * - Dashboard title
 * - Key stats (users, makers, products, videos)
 * - Quick action links
 */
export default function FounderSidebar() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const apiBaseUrl = getApiBaseUrl();

      // Stagger requests to avoid overwhelming backend
      const usersJson = await fetchJsonWithRetry(`${apiBaseUrl}/users?limit=1`, {
        maxRetries: 1,
        retryDelay: 500,
      }).catch(() => ({ data: [], pagination: { total: 0 } }));

      await new Promise(resolve => setTimeout(resolve, 150));
      const makersJson = await fetchJsonWithRetry(`${apiBaseUrl}/makers?limit=1`, {
        maxRetries: 1,
        retryDelay: 500,
      }).catch(() => ({ data: [], total: 0, pagination: { total: 0 } }));

      await new Promise(resolve => setTimeout(resolve, 150));
      const productsJson = await fetchJsonWithRetry(`${apiBaseUrl}/products?limit=1`, {
        maxRetries: 1,
        retryDelay: 500,
      }).catch(() => ({ data: [], total: 0, pagination: { total: 0 } }));

      await new Promise(resolve => setTimeout(resolve, 150));
      const videosJson = await fetchJsonWithRetry(`${apiBaseUrl}/videos?limit=1`, {
        maxRetries: 1,
        retryDelay: 500,
      }).catch(() => ({ data: [], total: 0, pagination: { total: 0 } }));

      const statsData: DashboardStats = {
        users: usersJson.pagination?.total || usersJson.data?.length || 0,
        makers: makersJson.pagination?.total || makersJson.total || makersJson.data?.length || 0,
        products: productsJson.pagination?.total || productsJson.total || productsJson.data?.length || 0,
        videos: videosJson.pagination?.total || videosJson.total || videosJson.data?.length || 0,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          مركز القيادة للمؤسس
        </h1>
        <p className="text-sm text-gray-600">
          نظرة عامة على أداء المنصة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 mb-6">
        {/* Users Stat */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-blue-600 mb-1">{t('totalUsers') || 'إجمالي المستخدمين'}</p>
              <p className="text-2xl font-bold text-blue-900">
                {statsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  (stats?.users || 0).toLocaleString()
                )}
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">👥</span>
          </div>
        </div>

        {/* Makers Stat */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-purple-600 mb-1">{t('totalMakers') || 'إجمالي الحرفيين'}</p>
              <p className="text-2xl font-bold text-purple-900">
                {statsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  (stats?.makers || 0).toLocaleString()
                )}
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">🎨</span>
          </div>
        </div>

        {/* Products Stat */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-green-600 mb-1">{t('totalProducts') || 'إجمالي المنتجات'}</p>
              <p className="text-2xl font-bold text-green-900">
                {statsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  (stats?.products || 0).toLocaleString()
                )}
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">📦</span>
          </div>
        </div>

        {/* Videos Stat */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-red-600 mb-1">{t('totalVideos') || 'إجمالي الفيديوهات'}</p>
              <p className="text-2xl font-bold text-red-900">
                {statsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  (stats?.videos || 0).toLocaleString()
                )}
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">🎬</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          روابط سريعة
        </h3>
        
        <Link
          href="/ar/makers"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl" aria-hidden="true">👥</span>
          <span className="text-sm font-medium">الحرفيين</span>
        </Link>

        <Link
          href="/ar/products"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl" aria-hidden="true">📦</span>
          <span className="text-sm font-medium">المنتجات</span>
        </Link>

        <Link
          href="/ar/videos"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl" aria-hidden="true">🎬</span>
          <span className="text-sm font-medium">الفيديوهات</span>
        </Link>

        <Link
          href="/ar/orders"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl" aria-hidden="true">📋</span>
          <span className="text-sm font-medium">الطلبات</span>
        </Link>
      </div>
    </div>
  );
}


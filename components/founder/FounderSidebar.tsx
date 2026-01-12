'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const isRTL = language === 'ar';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Check if user is authenticated
      if (!token) {
        console.log('[FounderSidebar] No token available, skipping stats fetch');
        setStats({
          users: 0,
          makers: 0,
          products: 0,
          videos: 0,
        });
        return;
      }

      const apiBaseUrl = getApiBaseUrl();

      // Use the founder analytics endpoint with authentication
      const analyticsJson = await fetchJsonWithRetry(`${apiBaseUrl}/founder/analytics`, {
        maxRetries: 2,
        retryDelay: 1000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.error('[FounderSidebar] Failed to fetch founder analytics:', error);
        
        // If 401, user is not authorized as founder
        if (error.status === 401) {
          console.log('[FounderSidebar] User not authorized as founder');
          return null;
        }
        
        // For other errors, return empty stats
        return {
          summary: {
            totalUsers: 0,
            totalMakers: 0,
            totalProducts: 0,
            totalVideos: 0,
          }
        };
      });

      if (!analyticsJson) {
        // User is not a founder, show zeros
        setStats({
          users: 0,
          makers: 0,
          products: 0,
          videos: 0,
        });
        return;
      }

      const statsData: DashboardStats = {
        users: analyticsJson.summary?.totalUsers || 0,
        makers: analyticsJson.summary?.totalMakers || 0,
        products: analyticsJson.summary?.totalProducts || 0,
        videos: analyticsJson.summary?.totalVideos || 0,
        orders: analyticsJson.summary?.totalOrders || 0,
      };

      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('[FounderSidebar] Analytics fetched:', {
          analyticsJson,
          statsData,
        });
      }

      setStats(statsData);
    } catch (error) {
      console.error('[FounderSidebar] Failed to fetch dashboard stats:', error);
      // Set default stats on error
      setStats({
        users: 0,
        makers: 0,
        products: 0,
        videos: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-8">
      {/* Header */}
      <div className={cn('mb-6', isRTL && 'rtl-text-right')}>
        <h1 className={cn('text-xl font-bold text-gray-900 mb-2', isRTL && 'rtl-text-right')}>
          مركز القيادة للمؤسس
        </h1>
        <p className={cn('text-sm text-gray-600', isRTL && 'rtl-text-right')}>
          نظرة عامة على أداء المنصة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 mb-6">
        {/* Users Stat */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className={cn('flex items-center justify-between', isRTL && 'rtl-flip-row')}>
            <div className={cn('flex-1', isRTL && 'rtl-text-right')}>
              <p className={cn('text-xs text-blue-600 mb-1', isRTL && 'rtl-text-right')}>
                {t('totalUsers') || 'إجمالي المستخدمين'}
              </p>
              <p className={cn('text-2xl font-bold text-blue-900', isRTL && 'rtl-text-right')}>
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
          <div className={cn('flex items-center justify-between', isRTL && 'rtl-flip-row')}>
            <div className={cn('flex-1', isRTL && 'rtl-text-right')}>
              <p className={cn('text-xs text-purple-600 mb-1', isRTL && 'rtl-text-right')}>
                {t('totalMakers') || 'إجمالي الحرفيين'}
              </p>
              <p className={cn('text-2xl font-bold text-purple-900', isRTL && 'rtl-text-right')}>
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
          <div className={cn('flex items-center justify-between', isRTL && 'rtl-flip-row')}>
            <div className={cn('flex-1', isRTL && 'rtl-text-right')}>
              <p className={cn('text-xs text-green-600 mb-1', isRTL && 'rtl-text-right')}>
                {t('totalProducts') || 'إجمالي المنتجات'}
              </p>
              <p className={cn('text-2xl font-bold text-green-900', isRTL && 'rtl-text-right')}>
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
          <div className={cn('flex items-center justify-between', isRTL && 'rtl-flip-row')}>
            <div className={cn('flex-1', isRTL && 'rtl-text-right')}>
              <p className={cn('text-xs text-red-600 mb-1', isRTL && 'rtl-text-right')}>
                {t('totalVideos') || 'إجمالي الفيديوهات'}
              </p>
              <p className={cn('text-2xl font-bold text-red-900', isRTL && 'rtl-text-right')}>
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
        <h3 className={cn(
          'text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3',
          isRTL && 'rtl-text-right'
        )}>
          روابط سريعة
        </h3>
        
        <Link
          href={`/${language}/makers`}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors',
            isRTL && 'rtl-flip-row'
          )}
        >
          <span className="text-xl" aria-hidden="true">👥</span>
          <span className={cn('text-sm font-medium', isRTL && 'rtl-text-right')}>الحرفيين</span>
        </Link>

        <Link
          href={`/${language}/products`}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors',
            isRTL && 'rtl-flip-row'
          )}
        >
          <span className="text-xl" aria-hidden="true">📦</span>
          <span className={cn('text-sm font-medium', isRTL && 'rtl-text-right')}>المنتجات</span>
        </Link>

        <Link
          href={`/${language}/videos`}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors',
            isRTL && 'rtl-flip-row'
          )}
        >
          <span className="text-xl" aria-hidden="true">🎬</span>
          <span className={cn('text-sm font-medium', isRTL && 'rtl-text-right')}>الفيديوهات</span>
        </Link>

        <Link
          href={`/${language}/orders`}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors',
            isRTL && 'rtl-flip-row'
          )}
        >
          <span className="text-xl" aria-hidden="true">📋</span>
          <span className={cn('text-sm font-medium', isRTL && 'rtl-text-right')}>الطلبات</span>
        </Link>

        <Link
          href="/founder/analytics"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors',
            isRTL && 'rtl-flip-row'
          )}
        >
          <span className="text-xl" aria-hidden="true">📊</span>
          <span className={cn('text-sm font-medium', isRTL && 'rtl-text-right')}>التحليلات</span>
        </Link>

        <Link
          href="/founder/moderation"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors',
            isRTL && 'rtl-flip-row'
          )}
        >
          <span className="text-xl" aria-hidden="true">🛡️</span>
          <span className={cn('text-sm font-medium', isRTL && 'rtl-text-right')}>الإشراف</span>
        </Link>
      </div>
    </div>
  );
}


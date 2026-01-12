'use client';

import { useState, useEffect } from 'react';
import { founderAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalMakers: number;
    totalProducts: number;
    totalVideos: number;
    totalPosts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  orders: {
    byStatus: Record<string, number>;
  };
  dailySignups: Record<string, number>;
  topMakers: Array<{
    id: string;
    name: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      profilePicture: string | null;
    };
    productCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    userId: string;
    makerName: string | null;
    orderCount: number;
    price: number | null;
    imageUrl: string | null;
  }>;
  recentSignups: Array<{
    id: string;
    email: string;
    name: string | null;
    profilePicture: string | null;
    role: string;
    createdAt: string;
  }>;
}

export default function FounderAnalyticsClient() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await founderAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('[Analytics] Failed to load:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-semibold mb-4">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          {t('retry') || 'Retry'}
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { summary, orders, dailySignups, topMakers, topProducts, recentSignups } = analytics;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className={cn('text-sm text-gray-600 mb-2', isRTL && 'rtl-text-right')}>
            {t('totalUsers') || 'Total Users'}
          </p>
          <p className={cn('text-3xl font-bold text-gray-900', isRTL && 'rtl-text-right')}>
            {summary.totalUsers}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-2">{t('totalMakers') || 'Total Makers'}</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalMakers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-2">{t('totalProducts') || 'Total Products'}</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-2">{t('totalOrders') || 'Total Orders'}</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-2">{t('totalVideos') || 'Total Videos'}</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalVideos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-2">{t('totalPosts') || 'Total Posts'}</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalPosts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-2">{t('totalRevenue') || 'Total Revenue'}</p>
          <p className="text-3xl font-bold text-green-600">
            {new Intl.NumberFormat('ar-EG', {
              style: 'currency',
              currency: 'AED',
            }).format(summary.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className={cn('text-xl font-bold text-gray-900 mb-4', isRTL && 'rtl-text-right')}>
          {t('ordersByStatus') || 'Orders by Status'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(orders.byStatus).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{status}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Makers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className={cn('text-xl font-bold text-gray-900 mb-4', isRTL && 'rtl-text-right')}>
          {t('topMakers') || 'Top Makers'}
        </h3>
        {topMakers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noMakers') || 'No makers yet'}</p>
        ) : (
          <div className="space-y-4">
            {topMakers.map((maker) => (
              <div key={maker.id} className={cn(
                'flex items-center justify-between p-4 bg-gray-50 rounded-lg',
                isRTL && 'rtl-flip-row'
              )}>
                <div className={cn('flex items-center gap-4', isRTL && 'rtl-flip-row')}>
                  {maker.user.profilePicture && (
                    <img
                      src={maker.user.profilePicture}
                      alt={maker.name}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className={cn('font-semibold text-gray-900', isRTL && 'rtl-text-right')}>
                      {maker.name}
                    </p>
                    <p className={cn('text-sm text-gray-600', isRTL && 'rtl-text-right')}>
                      {maker.user.name || maker.user.email}
                    </p>
                  </div>
                </div>
                <div className={cn('text-right', isRTL && 'rtl-text-right')}>
                  <p className={cn('text-lg font-bold text-gray-900', isRTL && 'rtl-text-right')}>
                    {maker.productCount}
                  </p>
                  <p className={cn('text-xs text-gray-600', isRTL && 'rtl-text-right')}>
                    {t('products') || 'Products'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className={cn('text-xl font-bold text-gray-900 mb-4', isRTL && 'rtl-text-right')}>
          {t('topProducts') || 'Top Products'}
        </h3>
        {topProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noProducts') || 'No products yet'}</p>
        ) : (
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className={cn(
                'flex items-center justify-between p-4 bg-gray-50 rounded-lg',
                isRTL && 'rtl-flip-row'
              )}>
                <div className={cn('flex items-center gap-4', isRTL && 'rtl-flip-row')}>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className={cn('font-semibold text-gray-900', isRTL && 'rtl-text-right')}>
                      {product.name}
                    </p>
                    <p className={cn('text-sm text-gray-600', isRTL && 'rtl-text-right')}>
                      {product.makerName || 'Unknown Maker'}
                    </p>
                  </div>
                </div>
                <div className={cn('text-right', isRTL && 'rtl-text-right')}>
                  <p className={cn('text-lg font-bold text-gray-900', isRTL && 'rtl-text-right')}>
                    {product.orderCount}
                  </p>
                  <p className={cn('text-xs text-gray-600', isRTL && 'rtl-text-right')}>
                    {t('orders') || 'Orders'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Signups */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className={cn('text-xl font-bold text-gray-900 mb-4', isRTL && 'rtl-text-right')}>
          {t('recentSignups') || 'Recent Signups'}
        </h3>
        {recentSignups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noSignups') || 'No recent signups'}</p>
        ) : (
          <div className="space-y-3">
            {recentSignups.map((user) => (
              <div key={user.id} className={cn(
                'flex items-center justify-between p-3 bg-gray-50 rounded-lg',
                isRTL && 'rtl-flip-row'
              )}>
                <div className={cn('flex items-center gap-3', isRTL && 'rtl-flip-row')}>
                  {user.profilePicture && (
                    <img
                      src={user.profilePicture}
                      alt={user.name || user.email}
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className={cn('font-medium text-gray-900', isRTL && 'rtl-text-right')}>
                      {user.name || user.email}
                    </p>
                    <p className={cn('text-xs text-gray-600', isRTL && 'rtl-text-right')}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'FOUNDER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


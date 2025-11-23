'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MakerActivityData {
  activeMakers: number;
  newMakersThisWeek: number;
  newProductsToday: number;
  topMakers?: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
}

/**
 * Maker Activity Panel - Shows maker stats and activity
 * Luxury Gulf Founder Style
 */
export default function MakerActivityPanel() {
  const { token } = useAuth();
  const [data, setData] = useState<MakerActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMakerActivity();
  }, [token]);

  const fetchMakerActivity = async () => {
    try {
      setIsLoading(true);
      if (!token) return;

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
      ).catch(() => null);

      if (analyticsJson) {
        // Calculate new makers this week (placeholder logic)
        const totalMakers = analyticsJson.summary?.totalMakers || 0;
        const topMakers = analyticsJson.topMakers || [];

        setData({
          activeMakers: totalMakers,
          newMakersThisWeek: Math.floor(totalMakers * 0.1), // Placeholder: 10% of total
          newProductsToday: Math.floor((analyticsJson.summary?.totalProducts || 0) * 0.02), // Placeholder
          topMakers: topMakers.slice(0, 3), // Top 3 makers
        });
      } else {
        setData({
          activeMakers: 0,
          newMakersThisWeek: 0,
          newProductsToday: 0,
        });
      }
    } catch (error) {
      console.error('[MakerActivity] Error fetching data:', error);
      setData({
        activeMakers: 0,
        newMakersThisWeek: 0,
        newProductsToday: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1">نشاط الحرفيين</h3>
        <p className="text-xs text-slate-500">إحصائيات الحرفيين والمنتجات</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">الحرفيين النشطين</p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.activeMakers.toLocaleString('ar-SA') || '0'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">جدد هذا الأسبوع</p>
              <p className="text-2xl font-bold text-slate-900">
                +{data?.newMakersThisWeek || 0}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2">
              <p className="text-xs text-slate-500 mb-1">منتجات جديدة اليوم</p>
              <p className="text-2xl font-bold text-slate-900">
                +{data?.newProductsToday || 0}
              </p>
            </div>
          </div>

          {/* Top Makers */}
          {data?.topMakers && data.topMakers.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                أفضل الحرفيين
              </p>
              <div className="space-y-2">
                {data.topMakers.map((maker, index) => (
                  <div
                    key={maker.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg rtl:flex-row-reverse"
                  >
                    <div className="flex items-center gap-2 rtl:flex-row-reverse">
                      <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40">
                        <span className="text-xs font-bold text-amber-700">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {maker.name || 'حرفي بدون اسم'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {maker.productCount} منتج
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFounderKpis } from '@/hooks/useFounderKpis';
import { betaAPI } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';

interface BetaApplication {
  id: number;
  name: string;
  email: string;
  country: string;
  main_platform?: string | null;
  preferred_lang?: string | null;
  created_at: Date | string;
}

export default function MonitoringPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { kpis, loading: kpisLoading, refetch } = useFounderKpis();
  const [betaApplications, setBetaApplications] = useState<BetaApplication[]>([]);
  const [loadingBeta, setLoadingBeta] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role === 'FOUNDER') {
      const fetchBetaApplications = async () => {
        try {
          const response = await betaAPI.getApplications();
          if (response.success && response.applications) {
            setBetaApplications(response.applications as BetaApplication[]);
          }
        } catch (error) {
          console.error('Error fetching beta applications:', error);
        } finally {
          setLoadingBeta(false);
        }
      };

      fetchBetaApplications();
    }
  }, [authLoading, user]);

  if (authLoading || kpisLoading) {
    return <LoadingState fullScreen message="جاري التحميل..." />;
  }

  if (!user || user.role !== 'FOUNDER') {
    return <ErrorState message="هذه المساحة مخصصة للمؤسس فقط" fullScreen />;
  }

  // Calculate conversion rate
  const conversionRate = kpis && kpis.totalBetaApplications > 0
    ? ((kpis.totalArtisans / kpis.totalBetaApplications) * 100).toFixed(1)
    : '0.0';

  // Calculate daily averages (for week 1)
  const daysSinceLaunch = 1; // Will be calculated based on actual launch date
  const dailyBetaAvg = kpis && daysSinceLaunch > 0
    ? (kpis.totalBetaApplications / daysSinceLaunch).toFixed(1)
    : '0.0';
  const dailyArtisansAvg = kpis && daysSinceLaunch > 0
    ? (kpis.totalArtisans / daysSinceLaunch).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                📊 مراقبة إطلاق Beta
              </h1>
              <p className="text-gray-600">تتبع النمو والأداء في الأسبوع الأول</p>
            </div>
            <div className="flex gap-3">
              <Link href="/founder">
                <Button variant="secondary" className="text-sm">
                  لوحة التحكم الرئيسية
                </Button>
              </Link>
              <Button variant="primary" className="text-sm" onClick={refetch}>
                🔄 تحديث البيانات
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="p-6">
              <p className="text-sm font-medium text-blue-700 mb-2">طلبات البيتا</p>
              <p className="text-3xl font-bold text-blue-900">
                {kpisLoading ? '...' : (kpis?.totalBetaApplications || 0).toLocaleString('ar-EG')}
              </p>
              <p className="text-xs text-blue-600 mt-1">متوسط يومي: {dailyBetaAvg}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="p-6">
              <p className="text-sm font-medium text-green-700 mb-2">حرفيون مسجلون</p>
              <p className="text-3xl font-bold text-green-900">
                {kpisLoading ? '...' : (kpis?.totalArtisans || 0).toLocaleString('ar-EG')}
              </p>
              <p className="text-xs text-green-600 mt-1">متوسط يومي: {dailyArtisansAvg}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="p-6">
              <p className="text-sm font-medium text-purple-700 mb-2">معدل التحويل</p>
              <p className="text-3xl font-bold text-purple-900">
                {kpisLoading ? '...' : `${conversionRate}%`}
              </p>
              <p className="text-xs text-purple-600 mt-1">بيتا → حرفيون</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="p-6">
              <p className="text-sm font-medium text-orange-700 mb-2">طلبات جديدة هذا الأسبوع</p>
              <p className="text-3xl font-bold text-orange-900">
                {kpisLoading ? '...' : (kpis?.newBetaApplicationsThisWeek || 0).toLocaleString('ar-EG')}
              </p>
              <p className="text-xs text-orange-600 mt-1">نمو أسبوعي</p>
            </div>
          </Card>
        </div>

        {/* All KPIs */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">جميع المؤشرات</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpisLoading ? '...' : (kpis?.totalProducts || 0).toLocaleString('ar-EG')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الفيديوهات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpisLoading ? '...' : (kpis?.totalVideos || 0).toLocaleString('ar-EG')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpisLoading ? '...' : (kpis?.totalOrders || 0).toLocaleString('ar-EG')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpisLoading ? '...' : (kpis?.totalUsers || 0).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Beta Applications */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">أحدث طلبات البيتا</h2>
              <Link href="/founder/beta">
                <Button variant="text" className="text-sm">
                  عرض الكل →
                </Button>
              </Link>
            </div>
            {loadingBeta ? (
              <p className="text-center text-gray-500 py-8">جاري التحميل...</p>
            ) : betaApplications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات بعد</p>
            ) : (
              <div className="space-y-3">
                {betaApplications.slice(0, 10).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-600">{app.email} • {app.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(app.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      {app.preferred_lang && (
                        <p className="text-xs text-gray-400 mt-1">
                          {app.preferred_lang === 'ar' ? 'عربي' : app.preferred_lang === 'zh' ? 'صيني' : 'إنجليزي'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/founder/dashboard">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-gray-900 mb-2">📊 لوحة العمليات</h3>
              <p className="text-sm text-gray-600">عرض KPIs التفصيلية</p>
            </Card>
          </Link>
          <Link href="/founder/beta">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-gray-900 mb-2">📝 طلبات البيتا</h3>
              <p className="text-sm text-gray-600">مراجعة جميع الطلبات</p>
            </Card>
          </Link>
          <Link href="/founder/assistant">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-gray-900 mb-2">🐼 الباندا المستشار</h3>
              <p className="text-sm text-gray-600">استشارة حول البيانات</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}


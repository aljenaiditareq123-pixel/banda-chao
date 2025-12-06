'use client';

import { FounderKPIs } from '@/types/founder';
import { useFounderKpis } from '@/hooks/useFounderKpis';
import Link from 'next/link';
import Button from '@/components/Button';

interface KPICardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

function KPICard({ title, value, loading }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-100">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {loading ? (
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('ar-EG')}</p>
        )}
      </div>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 w-24 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function FounderDashboard() {
  const { kpis, loading, error, refetch } = useFounderKpis();

  const kpiItems = [
    { key: 'totalArtisans' as const, label: 'إجمالي الحرفيين' },
    { key: 'totalProducts' as const, label: 'إجمالي المنتجات' },
    { key: 'totalVideos' as const, label: 'إجمالي الفيديوهات' },
    { key: 'totalOrders' as const, label: 'إجمالي الطلبات' },
    { key: 'totalUsers' as const, label: 'إجمالي المستخدمين' },
    { key: 'newArtisansThisWeek' as const, label: 'حرفيون جدد هذا الأسبوع' },
    { key: 'newOrdersThisWeek' as const, label: 'طلبات جديدة هذا الأسبوع' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم المؤسس</h1>
              <p className="text-gray-600">نظرة شاملة على مؤشرات الأداء الرئيسية لمنصة Banda Chao</p>
            </div>
            <div className="flex gap-3">
              <Link href="/founder">
                <Button variant="secondary" className="text-sm">
                  لوحة التحكم الرئيسية
                </Button>
              </Link>
              <Link href="/founder/assistant">
                <Button 
                  variant="primary" 
                  className="text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-xl">🐼</span>
                  <span>الباندا المستشار</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">حدث خطأ أثناء جلب البيانات</p>
              </div>
              <button
                onClick={refetch}
                className="text-red-600 hover:text-red-800 font-medium underline"
              >
                إعادة المحاولة
              </button>
            </div>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </div>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Show skeleton loaders
            Array.from({ length: 7 }).map((_, index) => (
              <KPISkeleton key={index} />
            ))
          ) : kpis ? (
            // Show actual KPIs
            kpiItems.map((item) => (
              <KPICard
                key={item.key}
                title={item.label}
                value={kpis[item.key] ?? 0}
                loading={loading}
              />
            ))
          ) : (
            // No data state
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">لا توجد بيانات متاحة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






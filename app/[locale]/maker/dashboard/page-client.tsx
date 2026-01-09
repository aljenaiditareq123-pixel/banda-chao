'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import MakerLayout from '@/components/maker/MakerLayout';
import MakerStatsCards from '@/components/maker/MakerStatsCards';
import Button from '@/components/Button';
import { Plus, TrendingUp } from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MakerDashboardClientProps {
  locale: string;
}

// Mock sales data for chart
const generateSalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    sales: Math.floor(Math.random() * 5000) + 5000 + (index * 500),
  }));
};

export default function MakerDashboardClient({ locale }: MakerDashboardClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 12450,
    activeGroupBuys: 5,
    productsSold: 142,
    shopRating: 4.9,
  });
  const [salesData, setSalesData] = useState<ReturnType<typeof generateSalesData> | null>(null); // Initialize as null to prevent hydration mismatch
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Generate sales data on client side only to prevent hydration mismatch
  useEffect(() => {
    if (salesData === null) {
      setSalesData(generateSalesData());
    }
  }, [salesData]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }
      if (user.role !== 'MAKER') {
        router.push(`/${locale}/maker/join`);
        return;
      }
    }
  }, [user, authLoading, locale, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!user || user.role !== 'MAKER') {
    return null;
  }

  const makerName = user.name || user.email?.split('@')[0] || 'Master Artisan';

  return (
    <MakerLayout locale={locale} makerName={makerName}>
      <div className="p-6 lg:p-8">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 mb-2">
              {locale === 'ar' ? 'لوحة التحكم' : locale === 'zh' ? '控制面板' : 'Command Center'}
            </h1>
            <p className="text-gray-400">
              {locale === 'ar' 
                ? 'نظرة شاملة على أداء متجرك ومبيعاتك'
                : locale === 'zh'
                ? '全面了解您的商店和销售表现'
                : 'Complete overview of your shop performance and sales'}
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{locale === 'ar' ? 'إنشاء قائمة جديدة' : locale === 'zh' ? '创建新列表' : 'Create New Listing'}</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <MakerStatsCards locale={locale} stats={stats} />
        </div>

        {/* Sales Growth Chart */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {locale === 'ar' ? 'نمو المبيعات' : locale === 'zh' ? '销售增长' : 'Sales Growth'}
              </h2>
              <p className="text-sm text-gray-400">
                {locale === 'ar' ? 'آخر 6 أشهر' : locale === 'zh' ? '过去6个月' : 'Last 6 months'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-bold">+23.4%</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #F59E0B',
                  borderRadius: '8px',
                  color: '#FBBF24',
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#FBBF24', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6 hover:border-amber-500/40 transition-all">
            <h3 className="text-lg font-bold text-white mb-2">
              {locale === 'ar' ? 'إدارة المنتجات' : locale === 'zh' ? '管理产品' : 'Manage Products'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {locale === 'ar' ? 'عرض وتعديل جميع منتجاتك' : locale === 'zh' ? '查看和编辑您的所有产品' : 'View and edit all your products'}
            </p>
            <Button
              variant="secondary"
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => router.push(`/${locale}/maker/dashboard/products`)}
            >
              {locale === 'ar' ? 'عرض المنتجات' : locale === 'zh' ? '查看产品' : 'View Products'}
            </Button>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6 hover:border-amber-500/40 transition-all">
            <h3 className="text-lg font-bold text-white mb-2">
              {locale === 'ar' ? 'الطلبات النشطة' : locale === 'zh' ? '活跃订单' : 'Active Orders'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {locale === 'ar' ? 'تتبع ومعالجة الطلبات' : locale === 'zh' ? '跟踪和处理订单' : 'Track and process orders'}
            </p>
            <Button
              variant="secondary"
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => router.push(`/${locale}/maker/dashboard/orders`)}
            >
              {locale === 'ar' ? 'عرض الطلبات' : locale === 'zh' ? '查看订单' : 'View Orders'}
            </Button>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6 hover:border-amber-500/40 transition-all">
            <h3 className="text-lg font-bold text-white mb-2">
              {locale === 'ar' ? 'المحفظة' : locale === 'zh' ? '钱包' : 'Wallet'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {locale === 'ar' ? 'عرض الأرباح والسحوبات' : locale === 'zh' ? '查看收益和提款' : 'View earnings and withdrawals'}
            </p>
            <Button
              variant="secondary"
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => router.push(`/${locale}/maker/dashboard/wallet`)}
            >
              {locale === 'ar' ? 'عرض المحفظة' : locale === 'zh' ? '查看钱包' : 'View Wallet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Create Listing Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-amber-500/30 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 mb-4">
              {locale === 'ar' ? 'إنشاء قائمة جديدة' : locale === 'zh' ? '创建新列表' : 'Create New Listing'}
            </h2>
            <p className="text-gray-400 mb-6">
              {locale === 'ar' 
                ? 'سيتم إضافة نموذج إنشاء المنتج هنا قريباً'
                : locale === 'zh'
                ? '产品创建表单即将添加'
                : 'Product creation form will be added here soon'}
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
            >
              {locale === 'ar' ? 'إغلاق' : locale === 'zh' ? '关闭' : 'Close'}
            </Button>
          </div>
        </div>
      )}
    </MakerLayout>
  );
}

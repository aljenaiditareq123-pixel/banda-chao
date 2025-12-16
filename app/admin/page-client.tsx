'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { productsAPI, ordersAPI, usersAPI } from '@/lib/api';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

export default function AdminDashboardClient() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && user && (user.role === 'ADMIN' || user.role === 'FOUNDER')) {
      fetchStats();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    // HARDCODE MODE - Return dummy data, no API calls
    try {
      setLoadingStats(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return static dummy data
      setStats({
        products: 150,
        orders: 500,
        users: 1200,
        revenue: 50000,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to dummy data even on error
      setStats({
        products: 150,
        orders: 500,
        users: 1200,
        revenue: 50000,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'المنتجات',
      value: stats.products,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'الطلبات',
      value: stats.orders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      label: 'المستخدمين',
      value: stats.users,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'الإيرادات',
      value: `${stats.revenue.toLocaleString()} $`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">مرحباً بك في لوحة التحكم الإدارية</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/products"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">إضافة منتج جديد</h3>
            <p className="text-sm text-gray-600 mt-1">إضافة منتج جديد للمتجر</p>
          </a>
          <a
            href="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">عرض الطلبات</h3>
            <p className="text-sm text-gray-600 mt-1">إدارة الطلبات والمبيعات</p>
          </a>
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">إدارة المستخدمين</h3>
            <p className="text-sm text-gray-600 mt-1">عرض وإدارة المستخدمين</p>
          </a>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, MessageCircle, Clock } from 'lucide-react';
import AICouncil from '@/components/admin/AICouncil';
import { adminAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    pendingPayouts: 0,
    activeProducts: 0,
    totalMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getStats();
        
        if (response.success && response.stats) {
          setStats(response.stats);
          setRecentOrders(response.recentOrders || []);
          setRecentUsers(response.recentUsers || []);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statCards = [
    {
      label: 'الإيرادات الإجمالية',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      label: 'إجمالي المستخدمين',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'طلبات السحب المعلقة',
      value: stats.pendingPayouts.toLocaleString(),
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'المنتجات النشطة',
      value: stats.activeProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'إجمالي الرسائل',
      value: stats.totalMessages.toLocaleString(),
      icon: MessageCircle,
      color: 'bg-green-500',
    },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">مرحباً بك في لوحة التحكم الإدارية</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

      {/* Recent Orders and Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">أحدث الطلبات</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              عرض الكل →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد طلبات</div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {order.items[0]?.productImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={order.items[0].productImage}
                            alt={order.items[0].productName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {order.items[0]?.productName || 'طلب'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.userName || order.userEmail || 'مستخدم'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-left flex-shrink-0 ml-4">
                      <p className="font-bold text-gray-900">
                        {formatPrice(order.totalAmount, order.currency)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'PAID' || order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">أحدث المستخدمين</h2>
            <Link
              href="/admin/users"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              عرض الكل →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا يوجد مستخدمين</div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {user.profilePicture ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image
                          src={user.profilePicture}
                          alt={user.name || 'User'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name || 'مستخدم بدون اسم'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{user.role}</span>
                        {user.isVerified && (
                          <span className="inline-block w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Council Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <AICouncil />
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


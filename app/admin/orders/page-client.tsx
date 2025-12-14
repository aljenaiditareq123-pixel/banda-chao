'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/common/Card';
import OrdersTable from '@/components/admin/OrdersTable';
import { useOrders } from '@/hooks/useOrders';

/**
 * Admin Orders Page Client Component
 * Manages orders display and filtering
 */
export default function AdminOrdersPageClient() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const ordersResult = useOrders('all'); // Get all orders stats for summary cards
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Safety check for SSR - ensure stats is always defined
  const safeStats = ordersResult?.stats || { total: 0, paid: 0 };
  
  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
              <p className="text-gray-600">عرض وإدارة جميع طلبات العملاء</p>
            </div>
            <div className="flex gap-3">
              <Link href="/founder">
                <Button variant="secondary" className="text-sm">
                  لوحة التحكم الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-2">إجمالي الطلبات</p>
            <p className="text-3xl font-bold text-gray-900">{safeStats.total.toLocaleString('ar-EG')}</p>
          </Card>
          <Card className="bg-white border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-2">الطلبات المدفوعة</p>
            <p className="text-3xl font-bold text-gray-900">{safeStats.paid.toLocaleString('ar-EG')}</p>
            {safeStats.total > 0 && (
              <p className="text-xs text-green-600 mt-1">
                نسبة نجاح: {Math.round((safeStats.paid / safeStats.total) * 100)}%
              </p>
            )}
          </Card>
          <Card className="bg-white border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-2">الطلبات قيد الانتظار</p>
            <p className="text-3xl font-bold text-gray-900">{(safeStats.total - safeStats.paid).toLocaleString('ar-EG')}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">فلترة حسب الحالة:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">جميع الطلبات</option>
              <option value="PENDING">قيد الانتظار</option>
              <option value="PAID">مدفوعة</option>
              <option value="SHIPPED">تم الشحن</option>
              <option value="DELIVERED">تم التوصيل</option>
              <option value="CANCELLED">ملغاة</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <OrdersTable statusFilter={statusFilter} />
      </div>
    </div>
  );
}


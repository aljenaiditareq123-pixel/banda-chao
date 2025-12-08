'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import OrdersTable from '@/components/admin/OrdersTable';

/**
 * Admin Orders Page Client Component
 * Manages orders display and filtering
 */
export default function AdminOrdersPageClient() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

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


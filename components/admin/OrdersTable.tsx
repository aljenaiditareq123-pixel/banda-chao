'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/common/Card';

interface Order {
  id: string;
  customerName: string;
  date: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
}

interface OrdersTableProps {
  statusFilter: string;
}

/**
 * Orders Table Component
 * Displays orders in a beautiful table format
 */
export default function OrdersTable({ statusFilter }: OrdersTableProps) {
  // Mock data for demonstration
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      customerName: 'أحمد محمد',
      date: '2024-12-08',
      status: 'PAID',
      totalAmount: 299,
      currency: 'AED',
    },
    {
      id: 'ORD-2024-002',
      customerName: 'فاطمة علي',
      date: '2024-12-07',
      status: 'SHIPPED',
      totalAmount: 149,
      currency: 'AED',
    },
    {
      id: 'ORD-2024-003',
      customerName: 'محمد خالد',
      date: '2024-12-06',
      status: 'PENDING',
      totalAmount: 199,
      currency: 'AED',
    },
    {
      id: 'ORD-2024-004',
      customerName: 'سارة أحمد',
      date: '2024-12-05',
      status: 'DELIVERED',
      totalAmount: 299,
      currency: 'AED',
    },
    {
      id: 'ORD-2024-005',
      customerName: 'خالد إبراهيم',
      date: '2024-12-04',
      status: 'PAID',
      totalAmount: 149,
      currency: 'AED',
    },
    {
      id: 'ORD-2024-006',
      customerName: 'نورا حسن',
      date: '2024-12-03',
      status: 'CANCELLED',
      totalAmount: 199,
      currency: 'AED',
    },
  ]);

  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Status badge styling
  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
      DELIVERED: 'bg-purple-100 text-purple-800 border-purple-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      PENDING: 'قيد الانتظار',
      PAID: 'مدفوعة',
      SHIPPED: 'تم الشحن',
      DELIVERED: 'تم التوصيل',
      CANCELLED: 'ملغاة',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      AED: 'د.إ',
      USD: '$',
      EUR: '€',
      SAR: 'ر.س',
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString('ar-EG')}`;
  };

  return (
    <Card className="overflow-hidden">
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'لا توجد طلبات في النظام حالياً'
              : 'لا توجد طلبات بهذه الحالة'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ الإجمالي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(order.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button
                        variant="text"
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        التفاصيل
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              إجمالي الطلبات المعروضة: <span className="font-semibold text-gray-900">{filteredOrders.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              إجمالي المبلغ: <span className="font-semibold text-gray-900">
                {formatCurrency(
                  filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
                  'AED'
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


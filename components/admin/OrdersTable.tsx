'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/common/Card';
import { useOrders, Order } from '@/hooks/useOrders';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

interface OrdersTableProps {
  statusFilter: string;
}

/**
 * Orders Table Component
 * Displays orders from database in a beautiful table format
 */
export default function OrdersTable({ statusFilter }: OrdersTableProps) {
  // Safe hook call with fallback - ensure we never destructure from undefined
  const ordersResult = useOrders(statusFilter);
  
  // Safety: Ensure all properties exist with fallbacks
  const orders = ordersResult?.orders || [];
  const loading = ordersResult?.loading ?? true;
  const error = ordersResult?.error || null;
  const stats = ordersResult?.stats || { total: 0, paid: 0 };
  const refetch = ordersResult?.refetch || (async () => {});

  // Status badge styling
  const getStatusBadge = (status: Order['status']) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
      DELIVERED: 'bg-purple-100 text-purple-800 border-purple-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      FAILED: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const labels: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      PAID: 'مدفوعة',
      SHIPPED: 'تم الشحن',
      DELIVERED: 'تم التوصيل',
      CANCELLED: 'ملغاة',
      FAILED: 'فشل',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Format date - SSR-safe: returns consistent format during SSR and client
  const formatDate = (dateString: string) => {
    try {
      // Only format if we have a valid date string
      if (!dateString) return '';
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      // Format date - this will be consistent across server and client
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format currency (default to AED) - SSR-safe: returns consistent format
  const formatCurrency = (amount: number, currency: string = 'AED') => {
    const symbols: Record<string, string> = {
      AED: 'د.إ',
      USD: '$',
      EUR: '€',
      SAR: 'ر.س',
    };
    // Ensure amount is a valid number
    const numAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    // Use consistent locale formatting
    return `${symbols[currency] || currency} ${numAmount.toLocaleString('ar-EG')}`;
  };

  // Get customer name from order
  const getCustomerName = (order: Order): string => {
    return order.users?.name || order.users?.email || 'عميل غير معروف';
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <div className="p-12">
          <LoadingState message="جاري تحميل الطلبات..." />
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <div className="p-12">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {orders.length === 0 ? (
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات حتى الآن</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'لا توجد طلبات في النظام حالياً. سيتم عرض الطلبات هنا عند بدء العملاء بالشراء.'
              : 'لا توجد طلبات بهذه الحالة حالياً.'}
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCustomerName(order)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(order.totalAmount), 'AED')}
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
      {orders.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              إجمالي الطلبات المعروضة: <span className="font-semibold text-gray-900">{orders.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              إجمالي المبلغ: <span className="font-semibold text-gray-900">
                {formatCurrency(
                  orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
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


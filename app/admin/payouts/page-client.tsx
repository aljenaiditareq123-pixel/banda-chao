'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/formatCurrency';
import { Wallet, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

interface PayoutRequest {
  id: string;
  makerName: string;
  makerEmail: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  bankName: string;
  accountNumber: string;
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PayoutsPageClient() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, pageSize: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await apiClient.get('/orders/payouts', { params });
      if (response.data.success) {
        setPayouts(response.data.payouts || []);
      }
    } catch (error: any) {
      console.error('Error fetching payout requests:', error);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (id: string, status: 'COMPLETED' | 'REJECTED', adminNotes?: string) => {
    try {
      setUpdatingId(id);
      const response = await apiClient.patch(`/orders/payouts/${id}`, {
        status,
        adminNotes,
      });
      if (response.data.success) {
        await fetchPayouts(); // Refresh list
      }
    } catch (error: any) {
      console.error('Error updating payout status:', error);
      alert(error.response?.data?.message || 'فشل في تحديث حالة الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: 'قيد الانتظار',
        className: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      },
      APPROVED: {
        label: 'معتمد',
        className: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      },
      REJECTED: {
        label: 'مرفوض',
        className: 'bg-red-500/20 text-red-600 border-red-500/30',
      },
      COMPLETED: {
        label: 'تم التحويل',
        className: 'bg-green-500/20 text-green-600 border-green-500/30',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل طلبات السحب...</p>
        </div>
      </div>
    );
  }

  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;
  const completedCount = payouts.filter((p) => p.status === 'COMPLETED').length;
  const totalAmount = payouts
    .filter((p) => p.status === 'PENDING' || p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-blue-600" />
                إدارة طلبات السحب
              </h1>
              <p className="text-gray-600">عرض وإدارة جميع طلبات سحب الأرباح للتجار</p>
            </div>
            <Link href="/founder">
              <Button variant="secondary" className="text-sm">
                لوحة التحكم الرئيسية
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">الطلبات المعلقة</p>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">المبلغ المعلق</p>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalAmount, 'USD', 'ar')}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">الطلبات المكتملة</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">فلترة حسب الحالة:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الطلبات</option>
              <option value="PENDING">قيد الانتظار</option>
              <option value="APPROVED">معتمد</option>
              <option value="REJECTED">مرفوض</option>
              <option value="COMPLETED">تم التحويل</option>
            </select>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {payouts.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">لا توجد طلبات سحب</p>
              <p className="text-gray-500 text-sm">ستظهر طلبات السحب هنا عندما يطلبها التجار</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">اسم التاجر</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">اسم البنك</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم الحساب</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ الطلب</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payout.makerName}</p>
                          <p className="text-xs text-gray-500">{payout.makerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payout.amount, payout.currency, 'ar')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{payout.bankName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-mono">{payout.accountNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{formatDate(payout.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {payout.status === 'PENDING' || payout.status === 'APPROVED' ? (
                            <>
                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من أنك قمت بالتحويل؟ سيتم تغيير حالة الطلب إلى "تم التحويل"')) {
                                    updatePayoutStatus(payout.id, 'COMPLETED');
                                  }
                                }}
                                disabled={updatingId === payout.id}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                تم التحويل
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('سبب الرفض (اختياري):');
                                  if (notes !== null) {
                                    updatePayoutStatus(payout.id, 'REJECTED', notes || undefined);
                                  }
                                }}
                                disabled={updatingId === payout.id}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                رفض
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">لا توجد إجراءات متاحة</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

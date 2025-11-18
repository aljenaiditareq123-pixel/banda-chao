'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface OrdersPageClientProps {
  locale: string;
}

export default function OrdersPageClient({ locale }: OrdersPageClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { t, setLanguage } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    if (!authLoading && user) {
      loadOrders();
    }
  }, [authLoading, user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders();
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error('[Orders] Failed to load orders:', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          (locale === 'ar' ? 'فشل تحميل الطلبات' : locale === 'zh' ? '加载订单失败' : 'Failed to load orders')
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, Record<string, string>> = {
      PENDING: {
        ar: 'قيد الانتظار',
        zh: '待处理',
        en: 'Pending',
      },
      PROCESSING: {
        ar: 'قيد المعالجة',
        zh: '处理中',
        en: 'Processing',
      },
      SHIPPED: {
        ar: 'تم الشحن',
        zh: '已发货',
        en: 'Shipped',
      },
      DELIVERED: {
        ar: 'تم التسليم',
        zh: '已送达',
        en: 'Delivered',
      },
      CANCELLED: {
        ar: 'ملغى',
        zh: '已取消',
        en: 'Cancelled',
      },
    };
    return statusMap[status.toUpperCase()]?.[locale] || status;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {t('myOrders') || 'طلباتي'}
            </h1>
            <p className="text-lg text-gray-600">
              {t('myOrdersSubtitle') || 'عرض جميع طلباتك ومتابعة حالتها'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('loading') || 'جاري التحميل...'}</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-12 md:p-16 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                {t('noOrders') || 'لا توجد طلبات'}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('noOrdersDescription') || 'ابدأ التسوق الآن!'}
              </p>
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold shadow-lg"
              >
                <span>🛒</span>
                <span>{t('browseProducts') || 'تصفح المنتجات'}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900">
                            {t('orderNumber') || 'رقم الطلب'}: {order.id.slice(0, 8)}...
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-2xl md:text-3xl font-bold text-primary-600">
                          ¥{order.totalAmount.toFixed(2)}
                        </p>
                        <Link
                          href={`/${locale}/order/success?orderId=${order.id}`}
                          className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium"
                        >
                          {t('viewDetails') || 'عرض التفاصيل'} →
                        </Link>
                      </div>
                    </div>

                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">
                          {t('items') || 'العناصر'}:
                        </h4>
                        <div className="space-y-3">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                            >
                              {item.product.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">📦</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {t('quantity') || 'الكمية'}: {item.quantity} × ¥{item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-base font-bold text-gray-900">
                                ¥{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-200 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                      <p>
                        <span className="font-semibold text-gray-700">
                          {t('shippingTo') || 'الشحن إلى'}:
                        </span>{' '}
                        {order.shippingName}, {order.shippingAddress}, {order.shippingCity},{' '}
                        {order.shippingCountry}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


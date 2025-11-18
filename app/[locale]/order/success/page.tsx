'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      ordersAPI
        .getOrder(orderId)
        .then((response) => {
          setOrder(response.data.data);
        })
        .catch((err) => {
          console.error('Failed to fetch order:', err);
          setError('Failed to load order details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orderId]);

  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8 md:p-12 space-y-8">
        <div className="text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('thankYouForOrder') || 'شكراً لطلبك!'}
          </h1>
          <p className="text-lg text-gray-600">
            {t('orderPlacedSuccessfully') || 'تم استلام طلبك بنجاح'}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading') || 'جاري التحميل...'}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {order && !loading && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border-2 border-primary-200 p-6 md:p-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">{t('orderId') || 'رقم الطلب'}:</span>
                <span className="font-bold text-gray-900 text-lg">{order.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">{t('status') || 'الحالة'}:</span>
                <span className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-semibold uppercase">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-primary-200">
                <span className="text-gray-700 font-semibold text-lg">{t('total') || 'الإجمالي'}:</span>
                <span className="font-bold text-primary-700 text-2xl">¥{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.orderItems && order.orderItems.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('orderedItems') || 'العناصر المطلوبة'}:</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">📦</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {t('quantity') || 'الكمية'}: {item.quantity} × ¥{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <p className="text-sm text-blue-800 leading-relaxed">
                {t('orderProcessingMessage') || 'سيتم معالجة طلبك وإرسال تحديث عند شحن العناصر.'}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href={`/${locale || 'en'}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition font-semibold shadow-lg"
          >
            <span>🛒</span>
            <span>{t('continueShopping') || 'متابعة التسوق'}</span>
          </Link>
          {order && (
            <Link
              href={`/${locale || 'en'}/orders`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 border-2 border-primary-200 rounded-xl hover:bg-primary-50 transition font-semibold"
            >
              <span>📋</span>
              <span>{t('viewOrders') || 'عرض الطلبات'}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

interface CheckoutSuccessPageProps {
  params: {
    locale: string;
  };
}

export default function CheckoutSuccessPage({ params }: CheckoutSuccessPageProps) {
  const { locale } = params;
  const { t, setLanguage } = useLanguage();
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    // Get session_id from URL query params
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // Clear cart after successful payment
      clearCart();
    }
  }, [searchParams, clearCart]);

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-green-200 shadow-xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('paymentSuccessTitle') || 'Payment Successful! 🎉'}
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              {t('paymentSuccessMessage') || 'Thank you for your purchase. Your order has been confirmed.'}
            </p>
            {sessionId && (
              <p className="text-sm text-gray-500 mt-2">
                {t('orderId') || 'Order ID'}: {sessionId.slice(0, 20)}...
              </p>
            )}
          </div>

          <div className="space-y-4 mt-8">
            <Link href={`/${locale}/orders`}>
              <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base font-semibold">
                {t('viewOrders') || 'View My Orders'} →
              </Button>
            </Link>
            <div>
              <Link href={`/${locale}/products`}>
                <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base font-semibold">
                  {t('continueShopping') || 'Continue Shopping'}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('paymentSuccessNote') || 'You will receive an email confirmation shortly with your order details.'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}


'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckoutCancelPageProps {
  params: {
    locale: string;
  };
}

export default function CheckoutCancelPage({ params }: CheckoutCancelPageProps) {
  const { locale } = params;
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-amber-200 shadow-xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="h-20 w-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('paymentCancelledTitle') || 'Payment Cancelled'}
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              {t('paymentCancelledMessage') || 'Your payment was cancelled. No charges were made.'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {t('paymentCancelledNote') || 'You can complete your purchase anytime by returning to your cart.'}
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <Link href={`/${locale}/checkout`}>
              <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base font-semibold">
                {t('returnToCheckout') || 'Return to Checkout'} →
              </Button>
            </Link>
            <div>
              <Link href={`/${locale}/cart`}>
                <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base font-semibold">
                  {t('viewCart') || 'View Cart'}
                </Button>
              </Link>
            </div>
            <div>
              <Link href={`/${locale}/products`}>
                <Button variant="text" className="w-full sm:w-auto px-6 py-2 text-base">
                  {t('continueShopping') || 'Continue Shopping'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useEffect } from 'react';
import { trackCheckoutCompleted } from '@/lib/analytics';

interface CheckoutSuccessClientProps {
  locale: string;
  sessionId?: string;
}

export default function CheckoutSuccessClient({ locale, sessionId }: CheckoutSuccessClientProps) {
  useEffect(() => {
    // Track checkout completion event
    if (typeof window !== 'undefined' && sessionId) {
      trackCheckoutCompleted('', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'ar' ? 'تمت العملية بنجاح!' : locale === 'zh' ? '付款成功！' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600 mb-4">
            {locale === 'ar'
              ? 'شكراً لك على طلبك. تمت العملية بنجاح (تجريبياً).'
              : locale === 'zh'
              ? '感谢您的订单。付款成功（测试模式）。'
              : 'Thank you for your order. Payment completed successfully (test mode).'}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              {locale === 'ar'
                ? '⚠️ هذا دفع تجريبي - لم يتم خصم أموال حقيقية.'
                : locale === 'zh'
                ? '⚠️ 这是测试付款 - 未扣除真实资金。'
                : '⚠️ This was a test payment - no real money was charged.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/${locale}/products`} className="flex-1">
            <Button variant="primary" className="w-full">
              {locale === 'ar' ? 'استكشف المزيد من المنتجات' : locale === 'zh' ? '浏览更多产品' : 'Explore More Products'}
            </Button>
          </Link>
          <Link href={`/${locale}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              {locale === 'ar' ? 'العودة للصفحة الرئيسية' : locale === 'zh' ? '返回首页' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


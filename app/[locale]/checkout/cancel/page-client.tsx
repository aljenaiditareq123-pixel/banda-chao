'use client';

import Link from 'next/link';
import Button from '@/components/Button';

interface CheckoutCancelClientProps {
  locale: string;
  orderId?: string;
}

export default function CheckoutCancelClient({ locale, orderId }: CheckoutCancelClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'ar' ? 'تم إلغاء العملية' : locale === 'zh' ? '付款已取消' : 'Payment Cancelled'}
          </h1>
          <p className="text-gray-600 mb-4">
            {locale === 'ar'
              ? 'تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ.'
              : locale === 'zh'
              ? '付款已取消。未扣除任何金额。'
              : 'Payment was cancelled. No amount was charged.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/${locale}/products`} className="flex-1">
            <Button variant="primary" className="w-full">
              {locale === 'ar' ? 'استكشف المنتجات' : locale === 'zh' ? '浏览产品' : 'Explore Products'}
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


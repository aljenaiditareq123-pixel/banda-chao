'use client';

import Link from 'next/link';
import Button from '@/components/Button';

interface CheckoutPageClientProps {
  locale: string;
}

export default function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const texts = {
    ar: {
      title: 'إتمام الطلب',
      comingSoon: 'صفحة الدفع قريباً',
      description: 'نعمل على إضافة نظام دفع كامل. سيتم إتاحته قريباً.',
      backToProducts: 'العودة إلى المنتجات',
    },
    en: {
      title: 'Checkout',
      comingSoon: 'Checkout Coming Soon',
      description: 'We are working on adding a complete payment system. It will be available soon.',
      backToProducts: 'Back to Products',
    },
    zh: {
      title: '结账',
      comingSoon: '结账即将推出',
      description: '我们正在添加完整的支付系统。即将推出。',
      backToProducts: '返回产品',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{t.comingSoon}</p>
            <p className="text-sm text-gray-500">{t.description}</p>
          </div>

          <div className="mt-8">
            <Link href={`/${locale}/products`}>
              <Button variant="primary" className="w-full md:w-auto">
                {t.backToProducts}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



'use client';

import { useState } from 'react';
import StripeCheckoutButton from '@/components/checkout/StripeCheckoutButton';
import Card from '@/components/common/Card';

interface TestPaymentClientProps {
  locale: string;
}

export default function TestPaymentClient({ locale }: TestPaymentClientProps) {
  const [productId, setProductId] = useState('test-product-123');
  const [productName, setProductName] = useState('منتج تجريبي / Test Product');
  const [amount, setAmount] = useState(100);
  const [quantity, setQuantity] = useState(1);
  
  // Ensure productId starts with 'test-' for test mode
  const testProductId = productId.startsWith('test-') ? productId : `test-${productId}`;

  const texts = {
    ar: {
      title: 'اختبار الدفع - Stripe Checkout',
      description: 'استخدم هذا النموذج لاختبار تكامل Stripe Checkout',
      productId: 'معرف المنتج',
      productName: 'اسم المنتج',
      amount: 'المبلغ (بالدولار)',
      quantity: 'الكمية',
      note: 'ملاحظة: استخدم بطاقة اختبار Stripe: 4242 4242 4242 4242',
    },
    en: {
      title: 'Test Payment - Stripe Checkout',
      description: 'Use this form to test Stripe Checkout integration',
      productId: 'Product ID',
      productName: 'Product Name',
      amount: 'Amount (USD)',
      quantity: 'Quantity',
      note: 'Note: Use Stripe test card: 4242 4242 4242 4242',
    },
    zh: {
      title: '测试支付 - Stripe Checkout',
      description: '使用此表单测试 Stripe Checkout 集成',
      productId: '产品 ID',
      productName: '产品名称',
      amount: '金额（美元）',
      quantity: '数量',
      note: '注意：使用 Stripe 测试卡：4242 4242 4242 4242',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600 mb-8">{t.description}</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.productId}
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.productName}
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.amount}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.quantity}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">{t.note}</p>
          </div>

          <StripeCheckoutButton
            productId={testProductId}
            productName={productName}
            amount={amount}
            quantity={quantity}
            currency="USD"
            locale={locale}
            className="w-full"
          />
        </Card>
      </div>
    </div>
  );
}


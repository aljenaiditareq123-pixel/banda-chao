'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CartPageProps {
  params: {
    locale: string;
  };
}

const IMAGE_PLACEHOLDER = 'https://via.placeholder.com/160x160?text=Product';

export default function LocaleCartPage({ params }: CartPageProps) {
  const { locale } = params;
  const { items, updateQuantity, removeFromCart, totalItems } = useCart();
  const { t, setLanguage } = useLanguage();

  const subtotal = items.reduce(
    (accumulator, item) => accumulator + (item.product.price ?? 0) * item.quantity,
    0
  );

  const shippingPlaceholder = t('shippingPlaceholder') ?? 'Calculated at next step';
  const total = subtotal;

  const handleQuantityChange = (productId: string, delta: number) => {
    const current = items.find((item) => item.product.id === productId);
    if (!current) {
      return;
    }
    const nextQuantity = Math.max(1, current.quantity + delta);
    updateQuantity(productId, nextQuantity);
  };

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  return (
    <Layout showHeader={false}>
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{t('cartTitle') ?? 'سلة التسوق'}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <section className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20 space-y-6">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-xl font-semibold text-gray-700">{t('cartEmpty') ?? 'سلة التسوق فارغة'}</p>
                  <p className="text-gray-500">{t('cartEmptyDescription') ?? 'ابدأ بإضافة منتجات إلى سلة التسوق'}</p>
                  <Link href={`/${locale}/products`}>
                    <Button variant="primary" className="px-8 py-3 text-base font-semibold">
                      {t('browseProducts') ?? 'ابدأ التسوق'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 border border-gray-100 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.product.images?.[0] ?? IMAGE_PLACEHOLDER}
                            alt={item.product.name}
                            fill
                            sizes="112px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/${locale}/products/${item.product.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-[#2E7D32] transition"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            ¥{item.product.price?.toFixed(2) ?? '0.00'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="inline-flex items-center rounded-full border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.product.id, -1)}
                            className="px-3 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-4 py-2 text-base font-medium text-gray-900" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.product.id, 1)}
                            className="px-3 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <Button
                          variant="text"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          {t('remove') ?? 'Remove'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8 space-y-6 h-fit sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900">{t('orderSummary') ?? 'ملخص الطلب'}</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="font-medium">{t('subtotal') ?? 'المجموع الفرعي'}</span>
                  <span className="font-semibold text-gray-900">¥{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>{t('shipping') ?? 'الشحن'}</span>
                  <span className="text-sm">{shippingPlaceholder}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 flex items-center justify-between">
                  <span className="font-bold text-lg text-gray-900">{t('total') ?? 'الإجمالي'}</span>
                  <span className="font-bold text-primary-600 text-xl">¥{total.toFixed(2)}</span>
                </div>
              </div>
              <Link href={`/${locale}/checkout`} className={items.length === 0 ? 'pointer-events-none' : ''}>
                <Button isFullWidth disabled={items.length === 0} variant="primary" className="py-3 text-base font-semibold">
                  {t('proceedToCheckout') ?? 'الانتقال إلى الدفع'}
                </Button>
              </Link>
              <p className="text-xs text-center text-gray-500 pt-2 border-t border-gray-200">
                {t('cartItemsCount')?.replace('{count}', totalItems.toString()) ?? `${totalItems} عنصر في السلة`}
              </p>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}


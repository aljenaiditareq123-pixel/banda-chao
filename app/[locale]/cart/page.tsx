'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import { Grid, GridItem } from '@/components/Grid';
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

  const handleLocaleSync = () => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  };

  handleLocaleSync();

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">{t('cartTitle') ?? 'Shopping Cart'}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <p className="text-lg text-gray-600">{t('cartEmpty') ?? 'Your cart is empty.'}</p>
                  <Link href={`/${locale}/products`}>
                    <Button>
                      {t('browseProducts') ?? 'Browse Products'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="h-24 w-24 sm:h-28 sm:w-28 border border-gray-100 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.product.images?.[0] ?? IMAGE_PLACEHOLDER}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
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

            <aside className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 h-fit">
              <h2 className="text-2xl font-semibold text-gray-900">{t('orderSummary') ?? 'Order Summary'}</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>{t('subtotal') ?? 'Subtotal'}</span>
                  <span className="font-semibold text-gray-900">¥{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('shipping') ?? 'Shipping'}</span>
                  <span>{shippingPlaceholder}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-base">
                  <span className="font-semibold text-gray-900">{t('total') ?? 'Total'}</span>
                  <span className="font-semibold text-[#2E7D32] text-lg">¥{total.toFixed(2)}</span>
                </div>
              </div>
              <Link href={`/${locale}/checkout`} className={items.length === 0 ? 'pointer-events-none' : ''}>
                <Button isFullWidth disabled={items.length === 0}>
                  {t('proceedToCheckout') ?? 'Proceed to Checkout'}
                </Button>
              </Link>
              <p className="text-xs text-gray-400">
                {t('cartItemsCount')?.replace('{count}', totalItems.toString()) ?? `${totalItems} item(s) in cart`}
              </p>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}


'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { checkoutAPI } from '@/lib/api';

interface CheckoutPageProps {
  params: {
    locale: string;
  };
}

const IMAGE_PLACEHOLDER = 'https://via.placeholder.com/80x80?text=Item';

export default function LocaleCheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = params;
  const { items } = useCart();
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0),
    [items]
  );
  const total = subtotal;

  const [formValues, setFormValues] = useState({
    fullName: '',
    country: '',
    city: '',
    street: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const shippingPlaceholder = t('shippingPlaceholder') ?? 'Calculated at next step';

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">
            {t('checkoutTitle') ?? 'Checkout'}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('shippingInformation') ?? 'Shipping Information'}
              </h2>
              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('fullName') ?? 'Full Name'}
                  </label>
                  <Input
                    required
                    value={formValues.fullName}
                    onChange={handleChange('fullName')}
                    placeholder={t('fullNamePlaceholder') ?? 'Enter your full name'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('country') ?? 'Country'}
                  </label>
                  <Input
                    required
                    value={formValues.country}
                    onChange={handleChange('country')}
                    placeholder={t('countryPlaceholder') ?? 'Enter your country'}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('city') ?? 'City'}
                    </label>
                    <Input
                      required
                      value={formValues.city}
                      onChange={handleChange('city')}
                      placeholder={t('cityPlaceholder') ?? 'Enter your city'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('streetAddress') ?? 'Street Address'}
                    </label>
                    <Input
                      required
                      value={formValues.street}
                      onChange={handleChange('street')}
                      placeholder={t('streetPlaceholder') ?? 'Enter your street'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phoneNumber') ?? 'Phone Number'}
                  </label>
                  <Input
                    required
                    value={formValues.phone}
                    onChange={handleChange('phone')}
                    placeholder={t('phonePlaceholder') ?? 'Enter your phone number'}
                    type="tel"
                  />
                </div>
              </form>
              <div className="text-sm text-gray-500">
                {t('checkoutNote') ?? 'We will use this information to ship your order.'}
              </div>
            </section>

            <aside className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 h-fit">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('orderSummary') ?? 'Order Summary'}
              </h2>

              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    {t('cartEmpty') ?? 'Your cart is empty.'}{' '}
                    <Link href={`/${locale}/products`} className="text-[#2E7D32] hover:text-[#256628]">
                      {t('browseProducts') ?? 'Browse Products'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                            <img
                              src={item.product.images?.[0] ?? IMAGE_PLACEHOLDER}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">
                              {t('quantity') ?? 'Qty'}: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          ¥{((item.product.price ?? 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

              <Button
                isFullWidth
                disabled={items.length === 0 || isSubmitting}
                onClick={async () => {
                  if (items.length === 0 || isSubmitting) return;

                  setError(null);

                  const isFormValid = Object.values(formValues).every(
                    (value) => value.trim().length > 0
                  );

                  if (!isFormValid) {
                    setError(t('checkoutFormInvalid') ?? 'Please complete all shipping fields.');
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    const payload = items.map((item) => ({
                      productId: item.product.id,
                      quantity: item.quantity,
                    }));

                    const { url } = await checkoutAPI.createCheckoutSession(payload);

                    if (url) {
                      window.location.href = url;
                    } else {
                      throw new Error('Missing checkout URL');
                    }
                  } catch (checkoutError: any) {
                    console.error('[Checkout] Failed to create session:', checkoutError);
                    const message =
                      checkoutError.response?.data?.message ||
                      checkoutError.message ||
                      t('checkoutErrorGeneric') ||
                      'Unable to start checkout. Please try again.';
                    setError(message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting
                  ? t('processingPayment') ?? 'Processing…'
                  : t('proceedToPayment') ?? 'Proceed to Payment'}
              </Button>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}


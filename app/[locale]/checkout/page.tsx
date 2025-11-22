'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Input from '@/components/Input';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { paymentsAPI } from '@/lib/api';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface CheckoutPageProps {
  params: {
    locale: string;
  };
}

const IMAGE_PLACEHOLDER = 'https://via.placeholder.com/80x80?text=Item';

function CheckoutContent({ params }: CheckoutPageProps) {
  const { locale } = params;
  const { items, clearCart } = useCart();
  const { t, setLanguage } = useLanguage();
  const router = useRouter();

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
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {t('checkoutTitle') ?? 'الدفع'}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <section className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('shippingInformation') ?? 'معلومات الشحن'}
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

            <aside className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8 space-y-6 h-fit sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('orderSummary') ?? 'ملخص الطلب'}
              </h2>

              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {t('cartEmpty') ?? 'سلة التسوق فارغة'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('cartEmptyDescription') ?? 'ابدأ بإضافة منتجات إلى سلة التسوق'}
                    </p>
                    <Link
                      href={`/${locale}/products`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
                    >
                      <span>🛍️</span>
                      <span>{t('browseProducts') ?? 'تصفح المنتجات'}</span>
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

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <Button
                isFullWidth
                variant="primary"
                disabled={items.length === 0 || isSubmitting}
                className="py-3 text-base font-semibold"
                onClick={async () => {
                  if (items.length === 0 || isSubmitting) return;

                  setError(null);

                  // Validate cart items
                  const hasInvalidItems = items.some(
                    (item) =>
                      !item.product.id ||
                      !item.product.price ||
                      item.product.price <= 0 ||
                      item.quantity <= 0 ||
                      item.quantity > 99
                  );

                  if (hasInvalidItems) {
                    setError(t('checkoutCartInvalid') ?? 'Some items in your cart are invalid. Please refresh and try again.');
                    return;
                  }

                  // Validate form fields
                  const isFormValid = Object.values(formValues).every(
                    (value) => value.trim().length > 0
                  );

                  if (!isFormValid) {
                    setError(t('checkoutFormInvalid') ?? 'Please complete all shipping fields.');
                    return;
                  }

                  // Additional validation: phone number format (basic)
                  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                  if (!phoneRegex.test(formValues.phone.trim())) {
                    setError(t('checkoutPhoneInvalid') ?? 'Please enter a valid phone number.');
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    // Create Stripe checkout session
                    const response = await paymentsAPI.createCheckoutSession(
                      items.map((item) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                      }))
                    );

                    const { sessionId } = response.data;

                    if (!sessionId) {
                      throw new Error('No session ID returned from server');
                    }

                    // Initialize Stripe
                    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
                    if (!stripePublishableKey) {
                      throw new Error('Stripe publishable key not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment variables.');
                    }

                    const stripe: Stripe | null = await loadStripe(stripePublishableKey);
                    if (!stripe) {
                      throw new Error('Failed to load Stripe. Please check your publishable key.');
                    }

                    // Redirect to Stripe Checkout
                    // @ts-ignore - redirectToCheckout is available but types might be outdated
                    const checkoutResult = await stripe.redirectToCheckout({
                      sessionId,
                    });

                    if (checkoutResult?.error) {
                      throw new Error(checkoutResult.error.message || 'Failed to redirect to payment');
                    }
                  } catch (checkoutError: any) {
                    console.error('[Checkout] Failed to create checkout session:', checkoutError);
                    
                    // Extract error message with better fallback
                    let message = t('checkoutErrorGeneric') || 'Unable to proceed to payment. Please try again.';
                    
                    if (checkoutError.response?.data) {
                      const errorData = checkoutError.response.data;
                      message = errorData.error || errorData.message || message;
                      
                      // Handle specific error codes
                      if (checkoutError.response.status === 400) {
                        message = errorData.error || t('checkoutErrorValidation') || 'Invalid cart data. Please check your cart.';
                      } else if (checkoutError.response.status === 401) {
                        message = t('checkoutErrorAuth') || 'Please log in to complete your order.';
                      } else if (checkoutError.response.status >= 500) {
                        message = t('checkoutErrorServer') || 'Server error. Please try again later.';
                      }
                    } else if (checkoutError.message) {
                      message = checkoutError.message;
                    }
                    
                    setError(message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('processingPayment') ?? 'جاري المعالجة...'}
                  </>
                ) : (
                  t('proceedToPayment') ?? 'Proceed to Payment'
                )}
              </Button>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function LocaleCheckoutPage({ params }: CheckoutPageProps) {
  return (
    <ProtectedRoute locale={params.locale}>
      <CheckoutContent params={params} />
    </ProtectedRoute>
  );
}


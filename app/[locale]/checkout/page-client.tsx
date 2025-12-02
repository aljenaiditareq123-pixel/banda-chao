'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import { Grid, GridItem } from '@/components/Grid';
import { paymentsAPI } from '@/lib/api';
import { redirectToCheckout, saveOrderDraft, getOrderDraft, clearOrderDraft } from '@/lib/stripe-client';
import { maintenanceLogger } from '@/lib/maintenance-logger';

interface CheckoutPageClientProps {
  locale: string;
}

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  country: string;
  zipCode: string;
  phone?: string;
}

export default function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    city: '',
    country: '',
    zipCode: '',
    phone: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [orderSummary, setOrderSummary] = useState<{
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
  } | null>(null);

  // Load saved draft on mount
  useEffect(() => {
    const draft = getOrderDraft();
    if (draft && draft.productId === productId) {
      setShippingAddress(draft.shippingAddress || shippingAddress);
      maintenanceLogger.log('order_draft_loaded', {
        message: 'Order draft loaded from local storage',
        productId: draft.productId,
      }, 'info');
    }
  }, [productId]);

  // Translations
  const texts = {
    ar: {
      title: 'إتمام الطلب',
      shippingAddress: 'عنوان الشحن',
      orderSummary: 'ملخص الطلب',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'أدخل الاسم الكامل',
      street: 'العنوان',
      streetPlaceholder: 'اسم الشارع والرقم',
      city: 'المدينة',
      cityPlaceholder: 'أدخل المدينة',
      country: 'الدولة',
      countryPlaceholder: 'أدخل الدولة',
      zipCode: 'الرمز البريدي',
      zipCodePlaceholder: 'أدخل الرمز البريدي',
      phone: 'رقم الهاتف (اختياري)',
      phonePlaceholder: 'أدخل رقم الهاتف',
      subtotal: 'المجموع الفرعي',
      shipping: 'رسوم الشحن',
      total: 'الإجمالي',
      secureCheckout: 'إتمام الدفع الآمن',
      processing: 'جاري المعالجة...',
      error: 'حدث خطأ',
      required: 'هذا الحقل مطلوب',
      backToProducts: 'العودة إلى المنتجات',
    },
    en: {
      title: 'Checkout',
      shippingAddress: 'Shipping Address',
      orderSummary: 'Order Summary',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter full name',
      street: 'Street Address',
      streetPlaceholder: 'Street name and number',
      city: 'City',
      cityPlaceholder: 'Enter city',
      country: 'Country',
      countryPlaceholder: 'Enter country',
      zipCode: 'Zip Code',
      zipCodePlaceholder: 'Enter zip code',
      phone: 'Phone Number (Optional)',
      phonePlaceholder: 'Enter phone number',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      secureCheckout: 'Complete Secure Payment',
      processing: 'Processing...',
      error: 'An error occurred',
      required: 'This field is required',
      backToProducts: 'Back to Products',
    },
    zh: {
      title: '结账',
      shippingAddress: '送货地址',
      orderSummary: '订单摘要',
      fullName: '全名',
      fullNamePlaceholder: '输入全名',
      street: '街道地址',
      streetPlaceholder: '街道名称和号码',
      city: '城市',
      cityPlaceholder: '输入城市',
      country: '国家',
      countryPlaceholder: '输入国家',
      zipCode: '邮政编码',
      zipCodePlaceholder: '输入邮政编码',
      phone: '电话号码（可选）',
      phonePlaceholder: '输入电话号码',
      subtotal: '小计',
      shipping: '运费',
      total: '总计',
      secureCheckout: '完成安全支付',
      processing: '处理中...',
      error: '发生错误',
      required: '此字段为必填项',
      backToProducts: '返回产品',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  // Load order summary (mock data for now - should be fetched from API)
  useEffect(() => {
    // In a real implementation, fetch order details from API
    // For now, use mock data
    setOrderSummary({
      subtotal: 100.00,
      shipping: 10.00,
      total: 110.00,
      currency: 'USD',
    });
  }, []);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      setError(t.required + ': ' + t.fullName);
      return false;
    }
    if (!shippingAddress.street.trim()) {
      setError(t.required + ': ' + t.street);
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setError(t.required + ': ' + t.city);
      return false;
    }
    if (!shippingAddress.country.trim()) {
      setError(t.required + ': ' + t.country);
      return false;
    }
    if (!shippingAddress.zipCode.trim()) {
      setError(t.required + ': ' + t.zipCode);
      return false;
    }
    if (!productId) {
      setError('Product ID is missing');
      return false;
    }
    return true;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call checkout API
      const response = await paymentsAPI.createCheckout({
        productId: productId!,
        quantity: quantity,
        currency: orderSummary?.currency || 'USD',
      });

      if (response.success && response.sessionId) {
        try {
          // Redirect to Stripe Checkout using Stripe.js (with built-in retry)
          await redirectToCheckout(response.sessionId);
          // Clear draft on success
          clearOrderDraft();
        } catch (stripeError: any) {
          // The Backup Plan: Save order as draft if Stripe fails
          saveOrderDraft({
            productId: productId!,
            quantity: quantity,
            shippingAddress: shippingAddress,
            total: orderSummary?.total || 0,
          });

          maintenanceLogger.log('stripe_checkout_failed', {
            message: 'Stripe checkout failed, order saved as draft',
            error: stripeError.message,
            sessionId: response.sessionId,
          }, 'error');

          setError(
            locale === 'ar'
              ? 'فشل الاتصال بخدمة الدفع. تم حفظ طلبك كمسودة. يرجى المحاولة مرة أخرى.'
              : 'Payment service connection failed. Your order has been saved as draft. Please try again.'
          );
          setLoading(false);
        }
      } else if (response.success && response.checkoutUrl) {
        // Fallback: redirect directly if sessionId not available
        window.location.href = response.checkoutUrl;
      } else {
        setError(response.message || t.error);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      
      // The Backup Plan: Save order as draft on API failure
      saveOrderDraft({
        productId: productId!,
        quantity: quantity,
        shippingAddress: shippingAddress,
        total: orderSummary?.total || 0,
      });

      maintenanceLogger.log('checkout_api_failed', {
        message: 'Checkout API failed, order saved as draft',
        error: err.message,
      }, 'error');

      setError(
        locale === 'ar'
          ? 'حدث خطأ في الاتصال. تم حفظ طلبك كمسودة. يرجى المحاولة مرة أخرى.'
          : 'Connection error. Your order has been saved as draft. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    handleCheckout({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        <form onSubmit={handleCheckout}>
          <Grid
            columns={{ base: 1, lg: 3 }}
            gap="gap-8"
            className="mb-8"
          >
            {/* Main Column - Shipping Address Form */}
            <GridItem className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t.shippingAddress}
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.street} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      placeholder={t.streetPlaceholder}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  {/* City and Country Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.city} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder={t.cityPlaceholder}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.country} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder={t.countryPlaceholder}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Zip Code and Phone Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.zipCode} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder={t.zipCodePlaceholder}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.phone}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GridItem>

            {/* Side Column - Order Summary */}
            <GridItem className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t.orderSummary}
                </h2>

                {orderSummary ? (
                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-gray-700">
                      <span>{t.subtotal}</span>
                      <span className="font-medium">
                        {orderSummary.currency} {orderSummary.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between text-gray-700">
                      <span>{t.shipping}</span>
                      <span className="font-medium">
                        {orderSummary.currency} {orderSummary.shipping.toFixed(2)}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-4"></div>

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>{t.total}</span>
                      <span>
                        {orderSummary.currency} {orderSummary.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Error Message with Retry */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 mb-2">{error}</p>
                        {retryCount < 3 && (
                          <button
                            type="button"
                            onClick={handleRetry}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {locale === 'ar' ? 'إعادة المحاولة' : locale === 'zh' ? '重试' : 'Retry'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Checkout Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full mt-6 py-3 text-lg"
                      disabled={loading || !productId}
                    >
                      {loading ? t.processing : t.secureCheckout}
                    </Button>

                    {/* Back Link */}
                    <div className="mt-4 text-center">
                      <a
                        href={`/${locale}/products`}
                        className="text-sm text-[#2E7D32] hover:text-[#256628] underline"
                      >
                        {t.backToProducts}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
                    </p>
                  </div>
                )}
              </div>
            </GridItem>
          </Grid>
        </form>
      </div>
    </div>
  );
}

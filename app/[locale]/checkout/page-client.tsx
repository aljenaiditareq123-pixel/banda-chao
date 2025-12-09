'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { Grid, GridItem } from '@/components/Grid';
import { ordersAPI } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/formatCurrency';
import Card from '@/components/common/Card';

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

interface PaymentDetails {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export default function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, total: cartTotal, clearCart } = useCart();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    city: '',
    country: '',
    zipCode: '',
    phone: '',
  });

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error'; message: string; orderId?: string } | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState<{
    chinaToUae: number;
    handling: number;
    uaeToCustomer: number;
    region: string;
  } | null>(null);

  // Calculate order summary
  const MOCK_TAX_RATE = 0.15;
  const subtotal = cartTotal;
  const taxAmount = subtotal * MOCK_TAX_RATE;
  const shipping = shippingCost; // Use dynamic shipping cost from API
  const grandTotal = subtotal + shipping + taxAmount;
  const currency = items[0]?.currency || 'USD';

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderStatus) {
      router.push(`/${locale}/cart`);
    }
  }, [items.length, locale, router, orderStatus]);

  // Calculate shipping when country changes
  useEffect(() => {
    const calculateShipping = async () => {
      if (!shippingAddress.country || shippingAddress.country.trim() === '') {
        setShippingCost(0);
        setShippingDetails(null);
        return;
      }

      if (items.length === 0) {
        setShippingCost(0);
        setShippingDetails(null);
        return;
      }

      setShippingLoading(true);
      try {
        // Prepare items for shipping calculation (use default weight 1kg if not specified)
        const shippingItems = items.map(item => ({
          weightInKg: (item as any).weightInKg || 1, // Default 1kg per item
          quantity: item.quantity,
        }));

        const response = await ordersAPI.calculateShipping({
          country: shippingAddress.country.trim(),
          items: shippingItems,
        });

        if (response.success && response.shipping) {
          // Convert from AED to USD (approximate rate: 1 AED = 0.27 USD)
          // Or keep in AED if currency is AED
          const costInAED = response.shipping.cost;
          const costInCurrency = currency === 'AED' ? costInAED : costInAED * 0.27;
          
          setShippingCost(costInCurrency);
          setShippingDetails(response.shipping.details);
        } else {
          setShippingCost(0);
          setShippingDetails(null);
        }
      } catch (err: any) {
        console.error('Error calculating shipping:', err);
        // On error, set shipping to 0 (will show error or use fallback)
        setShippingCost(0);
        setShippingDetails(null);
      } finally {
        setShippingLoading(false);
      }
    };

    // Debounce the API call (wait 500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      calculateShipping();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [shippingAddress.country, items, currency]);

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
      tax: 'الضرائب (15%)',
      total: 'الإجمالي',
      secureCheckout: 'تأكيد الطلب',
      processing: 'جاري المعالجة...',
      error: 'حدث خطأ',
      required: 'هذا الحقل مطلوب',
      backToProducts: 'العودة إلى المنتجات',
      continueShopping: 'متابعة التسوق',
      paymentInfo: 'معلومات الدفع',
      cardName: 'الاسم على البطاقة',
      cardNumber: 'رقم البطاقة',
      expiry: 'تاريخ الانتهاء (MM/YY)',
      cvc: 'رمز الأمان (CVC)',
      emptyCart: 'لا يمكن إتمام الشراء. سلتك فارغة.',
      success: 'تم تأكيد طلبك بنجاح! رقم الطلب هو:',
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
      tax: 'Tax (15%)',
      total: 'Total',
      secureCheckout: 'Place Order',
      processing: 'Processing...',
      error: 'An error occurred',
      required: 'This field is required',
      backToProducts: 'Back to Products',
      continueShopping: 'Continue Shopping',
      paymentInfo: 'Payment Information',
      cardName: 'Name on Card',
      cardNumber: 'Card Number',
      expiry: 'Expiry (MM/YY)',
      cvc: 'CVC',
      emptyCart: 'Cannot proceed to checkout. Your cart is empty.',
      success: 'Your order has been placed successfully! Order ID:',
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
      tax: '税费 (15%)',
      total: '总计',
      secureCheckout: '确认订单',
      processing: '处理中...',
      error: '发生错误',
      required: '此字段为必填项',
      backToProducts: '返回产品',
      continueShopping: '继续购物',
      paymentInfo: '支付信息',
      cardName: '持卡人姓名',
      cardNumber: '卡号',
      expiry: '有效期 (MM/YY)',
      cvc: '安全码',
      emptyCart: '无法结账。购物车为空。',
      success: '订单已成功确认！订单号：',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  // List of countries with codes for dropdown
  const countries = [
    { code: 'US', name: { ar: 'الولايات المتحدة', en: 'United States', zh: '美国' } },
    { code: 'DE', name: { ar: 'ألمانيا', en: 'Germany', zh: '德国' } },
    { code: 'FR', name: { ar: 'فرنسا', en: 'France', zh: '法国' } },
    { code: 'GB', name: { ar: 'بريطانيا', en: 'United Kingdom', zh: '英国' } },
    { code: 'IT', name: { ar: 'إيطاليا', en: 'Italy', zh: '意大利' } },
    { code: 'ES', name: { ar: 'إسبانيا', en: 'Spain', zh: '西班牙' } },
    { code: 'NL', name: { ar: 'هولندا', en: 'Netherlands', zh: '荷兰' } },
    { code: 'BE', name: { ar: 'بلجيكا', en: 'Belgium', zh: '比利时' } },
    { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia', zh: '沙特阿拉伯' } },
    { code: 'AE', name: { ar: 'الإمارات', en: 'United Arab Emirates', zh: '阿拉伯联合酋长国' } },
    { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait', zh: '科威特' } },
    { code: 'QA', name: { ar: 'قطر', en: 'Qatar', zh: '卡塔尔' } },
    { code: 'BH', name: { ar: 'البحرين', en: 'Bahrain', zh: '巴林' } },
    { code: 'OM', name: { ar: 'عمان', en: 'Oman', zh: '阿曼' } },
    { code: 'EG', name: { ar: 'مصر', en: 'Egypt', zh: '埃及' } },
    { code: 'IN', name: { ar: 'الهند', en: 'India', zh: '印度' } },
    { code: 'AU', name: { ar: 'أستراليا', en: 'Australia', zh: '澳大利亚' } },
    { code: 'CA', name: { ar: 'كندا', en: 'Canada', zh: '加拿大' } },
    { code: 'JP', name: { ar: 'اليابان', en: 'Japan', zh: '日本' } },
    { code: 'CN', name: { ar: 'الصين', en: 'China', zh: '中国' } },
  ];

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const handlePaymentChange = (field: keyof PaymentDetails, value: string) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    if (items.length === 0) {
      setError(t.emptyCart);
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
    setOrderStatus(null);

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping: {
          name: shippingAddress.fullName,
          address: shippingAddress.street,
          city: shippingAddress.city,
          zip: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        payment: {
          cardName: paymentDetails.cardName,
          cardNumber: paymentDetails.cardNumber,
          expiry: paymentDetails.expiry,
          cvc: paymentDetails.cvc,
        },
        total: grandTotal,
      };

      // Create order via API
      const response = await ordersAPI.createOrder(orderData);

      if (response.success || response.orderId) {
        setOrderStatus({
          type: 'success',
          message: `${t.success} ${response.orderId || response.id || 'N/A'}`,
          orderId: response.orderId || response.id,
        });
        clearCart(); // Clear cart after successful order
      } else {
        setError(response.message || response.error || t.error);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.message || t.error);
      setLoading(false);
    }
  };

  // Show success screen
  if (orderStatus?.type === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-16" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'ar' ? 'تم تأكيد طلبك!' : locale === 'zh' ? '订单已确认！' : 'Order Confirmed!'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">{orderStatus.message}</p>
            <Link
              href={`/${locale}/products`}
              className="inline-block px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition duration-150"
            >
              {t.continueShopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 mb-8">{t.emptyCart}</p>
          <Link
            href={`/${locale}/products`}
            className="inline-block px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition duration-150"
          >
            {t.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{t.title}</h1>

        <form onSubmit={handleCheckout}>
          <Grid
            columns={{ base: 1, lg: 3 }}
            gap="gap-8"
            className="mb-8"
          >
            {/* Main Column - Shipping Address Form */}
            <GridItem className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-8">
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
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
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
                      onChange={(e) => handleShippingChange('street', e.target.value)}
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
                      onChange={(e) => handleShippingChange('city', e.target.value)}
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
                      <select
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleShippingChange('country', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent bg-white"
                        disabled={loading}
                      >
                        <option value="">{t.countryPlaceholder}</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name[locale as keyof typeof country.name] || country.name.en} ({country.code})
                          </option>
                        ))}
                      </select>
                      {shippingLoading && shippingAddress.country && (
                        <p className="mt-1 text-xs text-gray-500">
                          {locale === 'ar' ? 'جاري حساب الشحن...' : locale === 'zh' ? '正在计算运费...' : 'Calculating shipping...'}
                        </p>
                      )}
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
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
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
                      value={shippingAddress.phone || ''}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t.paymentInfo}
                </h2>
                <div className="p-3 mb-4 text-sm text-yellow-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100 rounded-lg">
                  {locale === 'ar' 
                    ? '**ملاحظة:** يتم استخدام بيانات دفع وهمية (Mock Payment) حاليًا لغرض الاختبار.'
                    : locale === 'zh'
                    ? '**注意：** 当前使用模拟支付数据进行测试。'
                    : '**Note:** Mock payment data is currently used for testing purposes.'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.cardName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={paymentDetails.cardName}
                      onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.cardNumber} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => handlePaymentChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                      pattern="[0-9]{16}"
                      placeholder="**** **** **** ****"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.expiry} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      value={paymentDetails.expiry}
                      onChange={(e) => handlePaymentChange('expiry', e.target.value)}
                      pattern="(0[1-9]|1[0-2])\/\d{2}"
                      placeholder="MM/YY"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.cvc} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      value={paymentDetails.cvc}
                      onChange={(e) => handlePaymentChange('cvc', e.target.value)}
                      pattern="[0-9]{3,4}"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>
              </Card>
            </GridItem>

            {/* Side Column - Order Summary */}
            <GridItem className="lg:col-span-1">
              <Card className="p-6 md:p-8 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t.orderSummary}
                </h2>

                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto border-b border-gray-200 pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span className="truncate pr-2">{item.name} (x{item.quantity})</span>
                        <span className="font-medium">{formatCurrency(item.subtotal, item.currency, locale)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-700">
                    <span>{t.subtotal}</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal, currency, locale)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-700">
                    <span>
                      {t.shipping}
                      {shippingLoading && shippingAddress.country && (
                        <span className="ml-2 text-xs text-gray-400">
                          {locale === 'ar' ? '(جاري الحساب...)' : locale === 'zh' ? '(计算中...)' : '(calculating...)'}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      {shippingLoading && shippingAddress.country ? (
                        <span className="text-gray-400">...</span>
                      ) : (
                        formatCurrency(shipping, currency, locale)
                      )}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between text-gray-700">
                    <span>{t.tax}</span>
                    <span className="font-medium">
                      {formatCurrency(taxAmount, currency, locale)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-4"></div>

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{t.total}</span>
                    <span className="text-sky-600">
                      {formatCurrency(grandTotal, currency, locale)}
                    </span>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-6 py-3 text-lg"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? t.processing : t.secureCheckout}
                  </Button>

                  {/* Back Link */}
                  <div className="mt-4 text-center">
                    <Link
                      href={`/${locale}/cart`}
                      className="text-sm text-[#2E7D32] hover:text-[#256628] underline"
                    >
                      {t.backToProducts}
                    </Link>
                  </div>
                </div>
              </Card>
            </GridItem>
          </Grid>
        </form>
      </div>
    </div>
  );
}


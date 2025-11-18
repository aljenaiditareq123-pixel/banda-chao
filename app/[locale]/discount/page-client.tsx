'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import Button from '@/components/Button';

interface DiscountPageClientProps {
  locale: string;
  initialCode?: string;
}

export default function DiscountPageClient({ locale, initialCode }: DiscountPageClientProps) {
  const { setLanguage, t } = useLanguage();
  const router = useRouter();
  const [code, setCode] = useState(initialCode || '');
  const [discount, setDiscount] = useState<{ percentage: number; valid: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  // Predefined discount codes (يمكن ربطها بـ API لاحقاً)
  const discountCodes: Record<string, number> = {
    'WELCOME10': 10,
    'FIRST20': 20,
    'SAVE30': 30,
    'SPECIAL50': 50,
  };

  const handleApplyCode = () => {
    if (!code.trim()) {
      setError(t('enterDiscountCode') || 'يرجى إدخال كود الخصم');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      const upperCode = code.toUpperCase().trim();
      const percentage = discountCodes[upperCode];

      if (percentage) {
        setDiscount({ percentage, valid: true });
        setError(null);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('discountCode', upperCode);
          localStorage.setItem('discountPercentage', percentage.toString());
        }
      } else {
        setDiscount(null);
        setError(t('invalidDiscountCode') || 'كود الخصم غير صحيح');
      }
      setLoading(false);
    }, 500);
  };

  const handleContinueShopping = () => {
    router.push(`/${locale}/products`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎁</div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t('discountTitle') || 'كود الخصم المؤقت'}
              </h1>
              <p className="text-gray-600 text-lg">
                {t('discountDescription') || 'أدخل كود الخصم للحصول على خصم خاص على مشترياتك'}
              </p>
            </div>

            {/* Discount Code Input */}
            <div className="mb-6">
              <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
                {t('discountCode') || 'كود الخصم'}
              </label>
              <div className="flex gap-3">
                <input
                  id="discountCode"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={t('enterCode') || 'أدخل الكود هنا'}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg font-semibold tracking-wider"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyCode();
                    }
                  }}
                />
                <Button
                  onClick={handleApplyCode}
                  disabled={loading || !code.trim()}
                  className="px-6"
                >
                  {loading ? t('applying') || 'جاري التطبيق...' : t('apply') || 'تطبيق'}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {discount && discount.valid && (
              <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  {t('discountApplied') || 'تم تطبيق الخصم بنجاح!'}
                </h3>
                <p className="text-lg text-green-700 font-semibold">
                  {t('discountPercentage') || 'خصم'} {discount.percentage}%
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {t('discountWillApply') || 'سيتم تطبيق الخصم تلقائياً عند الدفع'}
                </p>
              </div>
            )}

            {/* Available Codes Hint */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center mb-2">
                {t('availableCodes') || 'أكواد الخصم المتاحة:'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.keys(discountCodes).map((codeKey) => (
                  <span
                    key={codeKey}
                    className="px-3 py-1 bg-white rounded border border-gray-300 text-xs font-mono text-gray-700"
                  >
                    {codeKey}
                  </span>
                ))}
              </div>
            </div>

            {/* Continue Shopping Button */}
            <div className="mt-8">
              <Button
                variant="primary"
                isFullWidth
                onClick={handleContinueShopping}
                className="py-3"
              >
                {t('continueShopping') || 'متابعة التسوق'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


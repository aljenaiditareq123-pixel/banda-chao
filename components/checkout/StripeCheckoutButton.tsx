'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Button from '@/components/Button';

interface StripeCheckoutButtonProps {
  productId: string;
  productName: string;
  amount: number;
  quantity: number;
  currency?: string;
  locale?: string;
  className?: string;
  disabled?: boolean;
}

// Initialize Stripe (only once)
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default function StripeCheckoutButton({
  productId,
  productName,
  amount,
  quantity,
  currency = 'USD',
  locale = 'ar',
  className = '',
  disabled = false,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create checkout session via Next.js API route
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          productName, // Include productName for test mode
          quantity: Number(quantity), // Ensure it's a number
          amount: Number(amount), // Ensure it's a number
          currency,
          locale,
        }),
      });

      // Check if response is JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[StripeCheckoutButton] Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      if (!response.ok || !data.success) {
        console.error('[StripeCheckoutButton] API error:', {
          status: response.status,
          data: data,
        });
        throw new Error(data.error || data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('[StripeCheckoutButton] Checkout error:', {
        message: err.message,
        stack: err.stack,
        response: err.response,
        fullError: err,
      });
      
      // Provide user-friendly error message
      let errorMessage = 'حدث خطأ أثناء إنشاء جلسة الدفع';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'البيانات المرسلة غير صحيحة. يرجى التحقق من القيم المدخلة.';
      } else if (err.response?.status === 500) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const texts = {
    ar: {
      buy: 'شراء الآن',
      processing: 'جاري المعالجة...',
      error: 'حدث خطأ',
    },
    en: {
      buy: 'Buy Now',
      processing: 'Processing...',
      error: 'An error occurred',
    },
    zh: {
      buy: '立即购买',
      processing: '处理中...',
      error: '发生错误',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <Button
        onClick={handleCheckout}
        variant="primary"
        disabled={loading || disabled}
        className="w-full"
      >
        {loading ? t.processing : t.buy}
      </Button>
    </div>
  );
}


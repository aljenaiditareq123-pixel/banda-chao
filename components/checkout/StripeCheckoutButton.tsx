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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء جلسة الدفع');
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


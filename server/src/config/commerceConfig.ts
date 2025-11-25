/**
 * Commerce Configuration
 * Defines commission rates, supported currencies, and monetization settings
 */

export const commerceConfig = {
  // Commission rate (as decimal, e.g., 0.10 = 10%)
  commissionRate: parseFloat(process.env.COMMISSION_RATE || '0.10'), // 10% default

  // Supported currencies
  supportedCurrencies: ['USD', 'AED', 'CNY', 'EUR', 'GBP'],

  // Default currency
  defaultCurrency: 'USD' as const,

  // Minimum payout threshold (future feature)
  minPayoutThreshold: {
    USD: 50,
    AED: 200,
    CNY: 350,
    EUR: 45,
    GBP: 40,
  },

  // Subscription plans (future feature)
  subscriptionPlans: {
    FREE: {
      name: 'Free',
      price: 0,
      features: ['Basic listing', 'Up to 10 products', 'Basic analytics'],
    },
    PRO: {
      name: 'Pro',
      price: 29, // USD per month
      features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'AI pricing suggestions'],
    },
    PREMIUM: {
      name: 'Premium',
      price: 99, // USD per month
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Priority support',
        'AI pricing suggestions',
        'Featured listings',
        'Custom branding',
      ],
    },
  },
};

/**
 * Calculate platform fee and maker revenue
 */
export function calculateRevenue(totalPrice: number, currency: string = 'USD'): {
  platformFee: number;
  makerRevenue: number;
} {
  const commissionRate = commerceConfig.commissionRate;
  const platformFee = totalPrice * commissionRate;
  const makerRevenue = totalPrice - platformFee;

  return {
    platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimals
    makerRevenue: Math.round(makerRevenue * 100) / 100,
  };
}

/**
 * Get minimum payout threshold for currency
 */
export function getMinPayoutThreshold(currency: string): number {
  return commerceConfig.minPayoutThreshold[currency as keyof typeof commerceConfig.minPayoutThreshold] || 50;
}



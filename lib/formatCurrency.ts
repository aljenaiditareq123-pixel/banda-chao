/**
 * Format currency based on locale and currency code
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en'
): string {
  const localeMap: Record<string, string> = {
    ar: 'ar-AE',
    en: 'en-US',
    zh: 'zh-CN',
  };

  const currencyMap: Record<string, string> = {
    USD: 'USD',
    AED: 'AED',
    CNY: 'CNY',
    EUR: 'EUR',
    GBP: 'GBP',
  };

  const formattedLocale = localeMap[locale] || 'en-US';
  const formattedCurrency = currencyMap[currency] || currency;

  try {
    return new Intl.NumberFormat(formattedLocale, {
      style: 'currency',
      currency: formattedCurrency,
    }).format(amount);
  } catch (error) {
    // Fallback if currency or locale is not supported
    return `${amount} ${currency}`;
  }
}



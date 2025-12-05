export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en'): string {
  const localeMap: Record<string, string> = {
    ar: 'ar-SA',
    zh: 'zh-CN',
    en: 'en-US',
  };

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CNY: '¥',
    SAR: 'ر.س',
    AED: 'د.إ',
  };

  const displayLocale = localeMap[locale] || 'en-US';

  try {
    return new Intl.NumberFormat(displayLocale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    // Fallback to simple format
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

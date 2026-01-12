'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import ErrorState from '@/components/ui/ErrorState';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Locale-specific error boundary
 * Catches errors within the [locale] route segment
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    // Log error to console for debugging
    console.error('Locale Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <ErrorState
        title={t('error') || 'An error occurred'}
        message={error.message || t('unexpectedError') || 'An unexpected error occurred. Please try again.'}
        onRetry={reset}
        className="max-w-md"
      />
    </div>
  );
}


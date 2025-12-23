'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error caught by global-error.tsx:', error);
    }
    // In production, error tracking should happen server-side
    // but we don't expose details to users
  }, [error]);

  // Default to Arabic for global errors
  const texts = {
    ar: {
      title: 'حدث خطأ خطير',
      message: 'عذراً، حدث خطأ في النظام. فريق الصيانة يعمل على إصلاح المشكلة.',
      retryButton: 'إعادة المحاولة',
      contactSupport: 'إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني',
    },
    en: {
      title: 'Critical Error',
      message: 'Sorry, a critical system error occurred. Our maintenance team is working on fixing it.',
      retryButton: 'Try again',
      contactSupport: 'If the problem persists, please contact support',
    },
    zh: {
      title: '严重错误',
      message: '抱歉，发生了严重的系统错误。我们的维护团队正在修复。',
      retryButton: '重试',
      contactSupport: '如果问题仍然存在，请联系支持',
    },
  };

  // Try to detect locale from URL
  const locale = typeof window !== 'undefined' 
    ? (window.location.pathname.split('/')[1] || 'ar')
    : 'ar';

  const t = texts[locale as keyof typeof texts] || texts.ar;

  return (
    <html lang={locale}>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 text-red-600 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {t.title}
            </h1>
            
            <p className="text-gray-600 mb-4">
              {t.message}
            </p>

            <p className="text-sm text-gray-500 mb-8">
              {t.contactSupport}
            </p>

            <button
              onClick={reset}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t.retryButton}
            </button>

            {/* Only show error details in development */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Development Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

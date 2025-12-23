'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by error.tsx:', error);
    }
    // In production, you might want to send to error tracking service
    // but we don't expose details to users
  }, [error]);

  // Detect locale from URL or default to Arabic
  const locale = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[1] || 'ar'
    : 'ar';

  const texts = {
    ar: {
      title: 'حدث خطأ',
      message: 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      retryButton: 'إعادة المحاولة',
      homeButton: 'العودة للصفحة الرئيسية',
    },
    en: {
      title: 'Something went wrong',
      message: 'Sorry, an unexpected error occurred. Please try again.',
      retryButton: 'Try again',
      homeButton: 'Go to homepage',
    },
    zh: {
      title: '发生错误',
      message: '抱歉，发生了意外错误。请重试。',
      retryButton: '重试',
      homeButton: '返回首页',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.ar;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {t.title}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {t.message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t.retryButton}
          </button>
          
          <button
            onClick={() => router.push(`/${locale}`)}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {t.homeButton}
          </button>
        </div>

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
  );
}

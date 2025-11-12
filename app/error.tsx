'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-red-600 mb-4">⚠️</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ</h2>
        <p className="text-gray-600 mb-8">
          {error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          إعادة المحاولة
        </button>
        <div className="mt-4">
          <a
            href="/"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}


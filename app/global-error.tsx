'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-6xl font-bold text-red-600 mb-4">⚠️</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">خطأ عام</h2>
            <p className="text-gray-600 mb-8">
              {error.message || 'حدث خطأ غير متوقع في التطبيق.'}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


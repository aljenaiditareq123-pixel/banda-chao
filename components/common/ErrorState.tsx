import Button from '@/components/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  locale?: string;
}

export default function ErrorState({ message, onRetry, fullScreen = false, locale = 'en' }: ErrorStateProps) {
  const texts = {
    ar: {
      defaultTitle: 'حدث خطأ',
      defaultMessage: 'حدث خطأ أثناء تحميل البيانات',
      retryMessage: 'يرجى المحاولة مرة أخرى',
      retryButton: 'إعادة المحاولة',
    },
    en: {
      defaultTitle: 'An error occurred',
      defaultMessage: 'An error occurred while loading data',
      retryMessage: 'Please try again',
      retryButton: 'Retry',
    },
    zh: {
      defaultTitle: '发生错误',
      defaultMessage: '加载数据时发生错误',
      retryMessage: '请重试',
      retryButton: '重试',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const content = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {message || t.defaultTitle}
      </h3>
      <p className="text-gray-600 mb-4">
        {message ? t.retryMessage : t.defaultMessage}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {t.retryButton}
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}


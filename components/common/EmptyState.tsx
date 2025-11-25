interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  locale?: string;
}

export default function EmptyState({ title, message, icon = '📦', locale = 'en' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-6xl mb-4">{icon}</div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {message && (
        <p className="text-gray-600 max-w-md">{message}</p>
      )}
    </div>
  );
}


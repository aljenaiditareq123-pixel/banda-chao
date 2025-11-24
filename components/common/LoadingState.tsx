import React from 'react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  locale?: string;
}

export default function LoadingState({ message, fullScreen = false, locale = 'en' }: LoadingStateProps) {
  const defaultMessages = {
    ar: 'جاري التحميل...',
    en: 'Loading...',
    zh: '加载中...',
  };

  const displayMessage = message || defaultMessages[locale as keyof typeof defaultMessages] || defaultMessages.en;

  const content = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">{displayMessage}</p>
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


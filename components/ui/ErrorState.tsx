'use client';

import { ReactNode } from 'react';
import Button from '@/components/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center bg-red-50 border-2 border-red-200 rounded-3xl ${className}`}
      role="alert"
    >
      <div className="text-5xl mb-4" aria-hidden="true">
        ⚠️
      </div>
      {title && <h3 className="text-xl font-semibold text-red-900 mb-2">{title}</h3>}
      <p className="text-red-700 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

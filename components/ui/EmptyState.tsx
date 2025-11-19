'use client';

import { ReactNode } from 'react';
import Button from '@/components/Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export default function EmptyState({
  icon = '📦',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 ${className}`}
    >
      {typeof icon === 'string' ? (
        <div className="text-6xl mb-4" aria-hidden="true">
          {icon}
        </div>
      ) : (
        <div className="mb-4">{icon}</div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
      {action && (
        <Link href={action.href}>
          <Button variant="primary">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}

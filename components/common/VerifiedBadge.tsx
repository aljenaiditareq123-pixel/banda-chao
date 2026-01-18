'use client';

import { Check } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ className = '', size = 'md' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-blue-500 text-white ${sizeClasses[size]} ${className}`}
      title="حساب موثق"
    >
      <Check className={`${sizeClasses[size]} stroke-[3]`} />
    </span>
  );
}

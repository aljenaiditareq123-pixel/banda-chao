'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { clsx } from '@/lib/utils';

type IconPosition = 'left' | 'right';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: IconPosition;
}

const baseClasses =
  'w-full rounded-lg border bg-white text-[#1f2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 focus:border-[#2E7D32] transition';

const paddingClasses: Record<IconPosition, string> = {
  left: 'pl-11 pr-4',
  right: 'pl-4 pr-11',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      helperText,
      icon,
      iconPosition = 'left',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const computedPadding = icon ? paddingClasses[iconPosition] : 'px-4';

    return (
      <div className="space-y-2">
        <div className="relative">
          {icon && (
            <span
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
                iconPosition === 'left' ? 'left-3' : 'right-3'
              )}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            className={clsx(
              baseClasses,
              computedPadding,
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/40',
              disabled && 'bg-gray-100 text-gray-400 cursor-not-allowed',
              className
            )}
            aria-invalid={hasError}
            {...props}
          />
        </div>

        {(() => {
          const errorMessage = typeof error === 'string' ? error : undefined;
          const message = errorMessage ?? helperText;
          if (!message) return null;
          return (
            <p className={clsx('text-sm', hasError ? 'text-red-500' : 'text-gray-500')}>
              {message}
            </p>
          );
        })()}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

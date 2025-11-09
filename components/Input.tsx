'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  error?: string | boolean;
  helperText?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      iconLeft,
      iconRight,
      error,
      helperText,
      label,
      className,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              'w-full rounded-lg border bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1',
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:border-[#2E7D32] focus:ring-[#2E7D32]/40',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {iconRight}
            </span>
          )}
        </div>
        {hasError ? (
          <p className="text-xs text-red-600">{typeof error === 'string' ? error : helperText}</p>
        ) : (
          helperText && <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

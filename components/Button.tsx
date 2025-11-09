'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isFullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2E7D32] text-white hover:bg-[#256628] focus:ring-[#2E7D32]/60 border border-transparent',
  secondary:
    'bg-transparent text-[#2E7D32] border border-[#2E7D32] hover:bg-[#2E7D32]/10 focus:ring-[#2E7D32]/40',
  text:
    'bg-transparent text-[#111111] border border-transparent hover:text-[#2E7D32] focus:ring-[#2E7D32]/30',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isFullWidth = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], isFullWidth && 'w-full', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

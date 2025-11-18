'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from '@/lib/utils';
import { buttonStyles } from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: buttonStyles.variants.primary,
  secondary: buttonStyles.variants.secondary,
  outline: buttonStyles.variants.outline,
  ghost: buttonStyles.variants.ghost,
  danger: buttonStyles.variants.danger,
  success: buttonStyles.variants.success,
  text: 'bg-transparent hover:bg-transparent border-none shadow-none',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: buttonStyles.sizes.sm,
  md: buttonStyles.sizes.md,
  lg: buttonStyles.sizes.lg,
  xl: buttonStyles.sizes.xl,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isFullWidth = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          buttonStyles.base,
          variantClasses[variant],
          sizeClasses[size],
          isFullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

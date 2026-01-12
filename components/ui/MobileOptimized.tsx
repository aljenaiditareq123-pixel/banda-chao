/**
 * Mobile-Optimized Components
 * Provides better mobile experience for key UI elements
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

/**
 * Mobile-optimized card component
 */
export function MobileCard({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = true 
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200',
      shadow && 'shadow-sm',
      paddingClasses[padding],
      // Mobile-specific optimizations
      'touch-manipulation', // Improves touch responsiveness
      'active:scale-[0.98]', // Subtle press feedback
      'transition-transform duration-100',
      className
    )}>
      {children}
    </div>
  );
}

interface MobileGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Mobile-optimized grid layout
 */
export function MobileGrid({ 
  children, 
  columns = 1, 
  gap = 'md',
  className = '' 
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2'
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Mobile-optimized button component
 */
export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}: MobileButtonProps) {
  const baseClasses = cn(
    'font-medium rounded-lg transition-all duration-200',
    'touch-manipulation', // Better touch response
    'active:scale-[0.97]', // Press feedback
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    disabled && 'opacity-50 cursor-not-allowed',
    fullWidth && 'w-full'
  );

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
    outline: 'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]', // Minimum touch target
    md: 'px-4 py-3 text-base min-h-[44px]', // Recommended touch target
    lg: 'px-6 py-4 text-lg min-h-[48px]'   // Large touch target
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}

interface MobileInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search';
  disabled?: boolean;
  error?: string;
  className?: string;
}

/**
 * Mobile-optimized input component
 */
export function MobileInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  className = ''
}: MobileInputProps) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          // Base styles
          'w-full px-4 py-3 text-base rounded-lg border',
          'transition-colors duration-200',
          'touch-manipulation', // Better touch response
          
          // Focus styles
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          
          // State styles
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
          
          disabled && 'bg-gray-100 cursor-not-allowed',
          
          // Mobile-specific optimizations
          'min-h-[44px]', // Minimum touch target
          '-webkit-appearance-none', // Remove iOS styling
          
          className
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 rtl:text-right">
          {error}
        </p>
      )}
    </div>
  );
}

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Mobile-optimized modal component
 */
export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}: MobileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className={cn(
          // Mobile-first: full width bottom sheet
          'w-full bg-white rounded-t-2xl sm:rounded-2xl',
          'max-h-[90vh] overflow-y-auto',
          'transform transition-all duration-300',
          
          // Desktop: centered modal
          'sm:max-w-lg sm:w-full',
          
          // Animation classes would be added here
          'animate-slide-up sm:animate-fade-in',
          
          className
        )}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 rtl:text-right">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile-optimized list item component
 */
interface MobileListItemProps {
  children: ReactNode;
  onClick?: () => void;
  rightElement?: ReactNode;
  className?: string;
}

export function MobileListItem({
  children,
  onClick,
  rightElement,
  className = ''
}: MobileListItemProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-4',
        'border-b border-gray-100 last:border-b-0',
        'touch-manipulation',
        onClick && 'hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 text-left rtl:text-right',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {rightElement && (
        <div className="flex-shrink-0 ml-3 rtl:ml-0 rtl:mr-3">
          {rightElement}
        </div>
      )}
    </Component>
  );
}

/**
 * Mobile-optimized tabs component
 */
interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: MobileTabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Tab buttons - horizontal scroll on mobile */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-0 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium whitespace-nowrap',
                'border-b-2 transition-colors duration-200',
                'touch-manipulation min-h-[44px]',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="mt-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

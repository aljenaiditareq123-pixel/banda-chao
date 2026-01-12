'use client';

import { cn } from '@/lib/utils';

interface FounderKPICardProps {
  title: string; // Arabic title
  value: string | number;
  change?: string; // e.g., "+12.5%"
  trend?: 'up' | 'down' | 'neutral';
  description?: string; // Optional subtitle
  variant?: 'dark' | 'light'; // Dark card with gold border, or light card
  icon?: string; // Optional icon/emoji
}

/**
 * Founder KPI Card - Luxury Gulf Founder Style
 * 
 * Supports two variants:
 * - dark: Premium dark card with gold accent border (for primary KPIs)
 * - light: White card with subtle border (for secondary KPIs)
 */
export default function FounderKPICard({
  title,
  value,
  change,
  trend = 'neutral',
  description,
  variant = 'light',
  icon,
}: FounderKPICardProps) {
  const isDark = variant === 'dark';
  
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-500';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  // Format value if it's a number
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('ar-SA')
    : value;

  return (
    <div
      className={cn(
        'rounded-2xl p-6 shadow-md transition-all duration-200 hover:shadow-lg',
        isDark
          ? 'bg-slate-900 border border-amber-500/40 text-slate-50'
          : 'bg-white border border-slate-200 text-slate-900'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 rtl:flex-row-reverse">
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
              isDark
                ? 'bg-amber-500/20 border border-amber-500/40'
                : 'bg-amber-50 border border-amber-200'
            )}
          >
            {icon}
          </div>
        )}
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg',
              isDark ? 'bg-slate-800' : 'bg-slate-50',
              getTrendColor()
            )}
          >
            <span className="text-xs">{getTrendIcon()}</span>
            <span className="text-xs font-medium">{change}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3
          className={cn(
            'text-sm font-medium',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-3xl font-bold',
            isDark ? 'text-slate-50' : 'text-slate-900'
          )}
        >
          {formattedValue}
        </p>
        {description && (
          <p
            className={cn(
              'text-xs',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Subtle accent line (gold for dark, gray for light) */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </div>
  );
}


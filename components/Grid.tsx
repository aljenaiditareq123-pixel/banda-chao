'use client';

import { ReactNode } from 'react';
import { clsx } from '@/lib/utils';

interface GridProps {
  children: ReactNode;
  columns?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: string;
  className?: string;
}

function buildColumns(columns?: GridProps['columns']) {
  if (!columns) {
    return 'grid-cols-1';
  }

  const mapping: Array<[keyof NonNullable<GridProps['columns']>, string]> = [
    ['base', 'grid-cols'],
    ['sm', 'sm:grid-cols'],
    ['md', 'md:grid-cols'],
    ['lg', 'lg:grid-cols'],
    ['xl', 'xl:grid-cols'],
  ];

  return mapping
    .map(([key, prefix]) => {
      const value = columns[key];
      if (!value) return null;
      return `${prefix}-${value}`;
    })
    .filter(Boolean)
    .join(' ');
}

interface GridItemProps {
  children: ReactNode;
  className?: string;
}

export function Grid({ children, columns, gap = 'gap-6', align = 'stretch', className }: GridProps) {
  return (
    <div
      className={clsx(
        'grid',
        gap,
        buildColumns(columns),
        align === 'center' && 'items-center',
        align === 'start' && 'items-start',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        className
      )}
    >
      {children}
    </div>
  );
}

export function GridItem({ children, className }: GridItemProps) {
  return <div className={className}>{children}</div>;
}

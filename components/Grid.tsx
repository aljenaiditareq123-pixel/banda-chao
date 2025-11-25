import React from 'react';

interface GridProps {
  columns: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  children: React.ReactNode;
  className?: string;
}

export function Grid({ columns, gap = 'gap-4', children, className = '' }: GridProps) {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    if (columns.base) classes.push(`grid-cols-${columns.base}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    classes.push(gap);
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return <div className={getGridClasses()}>{children}</div>;
}

interface GridItemProps {
  children: React.ReactNode;
  className?: string;
}

export function GridItem({ children, className = '' }: GridItemProps) {
  return <div className={className}>{children}</div>;
}



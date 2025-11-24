import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : '';
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}


import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[#2E7D32] text-white hover:bg-[#256628] focus:ring-[#2E7D32]',
    secondary: 'bg-white text-[#2E7D32] border border-[#2E7D32] hover:bg-[#E8F5E9] focus:ring-[#2E7D32]',
    text: 'text-[#2E7D32] hover:text-[#256628] hover:bg-[#E8F5E9] focus:ring-[#2E7D32]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A reusable button component with different variants and sizes
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: 'text-white bg-primary hover:bg-primary/80',
    secondary: 'text-mediumGray bg-lightGray hover:bg-gray-300',
    outline: 'text-primary border border-primary hover:bg-primary/10',
    text: 'text-primary hover:underline'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  
  return (
    <button 
      className={`font-medium rounded-scalerrs transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

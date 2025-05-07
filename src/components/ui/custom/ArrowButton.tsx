'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { ArrowRight } from 'lucide-react';

interface ArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showArrow?: boolean;
}

export default function ArrowButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  showArrow = true,
  ...props
}: ArrowButtonProps) {
  // Base styles
  const baseStyles = "flex items-center justify-center font-medium transition-all duration-200";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-[#12131C] text-white hover:bg-[#2A2A3C]",
    secondary: "bg-white text-[#12131C] border border-[#12131C] hover:bg-gray-50",
    outline: "bg-transparent text-[#12131C] border border-[#12131C] hover:bg-gray-50"
  };
  
  // Size styles
  const sizeStyles = {
    sm: "px-3 py-2 text-sm rounded-full",
    md: "px-5 py-3 text-base rounded-full",
    lg: "px-6 py-4 text-lg rounded-full"
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
    </button>
  );
}

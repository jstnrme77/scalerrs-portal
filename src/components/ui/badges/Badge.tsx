'use client';

import React from 'react';

type BadgeProps = {
  label: string;
  bgColor: string;
  textColor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/**
 * A reusable badge component that can be customized with different colors and sizes
 */
export default function Badge({ 
  label, 
  bgColor, 
  textColor, 
  size = 'sm',
  className = '' 
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  return (
    <span 
      className={`font-medium rounded-full ${bgColor} ${textColor} ${sizeClasses[size]} ${className}`}
    >
      {label}
    </span>
  );
}

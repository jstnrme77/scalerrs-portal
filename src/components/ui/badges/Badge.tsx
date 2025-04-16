'use client';

import React, { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  bgColor?: string;
  textColor?: string;
};

/**
 * A reusable badge component that can be customized with different colors and sizes
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  bgColor,
  textColor
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-gold/10 text-gold',
    danger: 'bg-red-100 text-red-800',
    light: 'bg-gray-100 text-gray-600'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const colorClasses = bgColor && textColor ? `${bgColor} ${textColor}` : variantClasses[variant];

  return (
    <span
      className={`font-medium rounded-full ${colorClasses} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

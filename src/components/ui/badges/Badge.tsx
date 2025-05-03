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
function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  bgColor,
  textColor
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-[#9EA8FB]/10 text-[#9EA8FB]',
    secondary: 'bg-[#FCDC94]/10 text-[#12131C]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-[#FCDC94]/10 text-[#12131C]',
    danger: 'bg-red-100 text-red-800',
    light: 'bg-[#D9D9D9] text-[#12131C]'
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  };

  const colorClasses = bgColor && textColor ? `${bgColor} ${textColor}` : variantClasses[variant];

  return (
    <span
      className={`font-normal rounded-full ${colorClasses} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
export { Badge as CustomBadge };

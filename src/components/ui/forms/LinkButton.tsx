'use client';

import Link from 'next/link';
import WhiteArrow from '@/components/ui/icons/WhiteArrow';

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showArrow?: boolean;
}

export default function LinkButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  showArrow = true,
}: LinkButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <Link
      href={href}
      className={`font-bold rounded-[16px] transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className} flex items-center justify-center gap-2 text-white`}
    >
      <span>{children}</span>
      {showArrow && (
        <WhiteArrow size={16} />
      )}
    </Link>
  );
}

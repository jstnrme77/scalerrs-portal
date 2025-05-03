'use client';

import React, { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A base card component with consistent styling
 */
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`card bg-white p-4 rounded-[16px] border border-lightGray shadow-sm ${className}`}>
      {children}
    </div>
  );
}

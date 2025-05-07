'use client';

import React from 'react';

interface WhiteArrowProps {
  size?: number;
  className?: string;
}

export default function WhiteArrow({ size = 16, className = '' }: WhiteArrowProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`white-arrow ${className}`}
      style={{ color: 'white' }}
    >
      <path d="M5 12h14" stroke="white"></path>
      <path d="m12 5 7 7-7 7" stroke="white"></path>
    </svg>
  );
}

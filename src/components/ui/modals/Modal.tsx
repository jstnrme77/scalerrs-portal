'use client';

import React, { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

/**
 * A reusable modal component
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  size = 'md'
}: ModalProps) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-[16px] shadow-lg ${sizeClasses[size]} w-full ${className}`}>
        <div className="p-6 border-b border-lightGray">
          <h3 className="text-lg font-medium text-dark">{title}</h3>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

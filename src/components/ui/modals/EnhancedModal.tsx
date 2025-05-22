'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

type EnhancedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
};

/**
 * An enhanced modal component with animations and accessibility features
 */
export default function EnhancedModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'lg',
  showCloseButton = true
}: EnhancedModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Add a timeout to ensure the animation completes before removing from DOM
      const timer = setTimeout(() => {
        setIsAnimating(false);
        // Restore body scrolling when modal is closed
        document.body.style.overflow = '';
      }, 300); // Match this with the transition duration

      return () => clearTimeout(timer);
    }

    // Cleanup function to ensure body scrolling is restored
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[800px] w-full'
  };

  return (
    <div
      className={`fixed inset-0 bg-transparent flex items-center justify-center z-[9999] p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-[16px] shadow-xl border border-[#D9D9D9] ${sizeClasses[size]} w-full ${className} transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#D9D9D9] flex justify-between items-center">
          <h3 className="text-lg font-medium text-[#12131C]" id="modal-title">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-[#12131C] hover:text-[#9EA8FB] transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

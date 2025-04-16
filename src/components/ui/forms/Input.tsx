'use client';

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

/**
 * A reusable form input component
 */
export default function Input({ 
  label, 
  error, 
  className = '', 
  ...props 
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-mediumGray mb-1">
          {label}
        </label>
      )}
      
      <input 
        className={`w-full border ${error ? 'border-red-500' : 'border-lightGray'} rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary`}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

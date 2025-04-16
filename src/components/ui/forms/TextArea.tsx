'use client';

import React, { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

/**
 * A reusable form textarea component
 */
export default function TextArea({ 
  label, 
  error, 
  className = '', 
  ...props 
}: TextAreaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-mediumGray mb-1">
          {label}
        </label>
      )}
      
      <textarea 
        className={`w-full border ${error ? 'border-red-500' : 'border-lightGray'} rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary`}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

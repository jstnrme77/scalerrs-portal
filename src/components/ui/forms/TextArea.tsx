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
        <label className="block text-sm font-medium text-[#4F515E] mb-1">
          {label}
        </label>
      )}

      <textarea
        className={`w-full border ${error ? 'border-red-500' : 'border-[#D9D9D9]'} rounded-md px-3 py-2 text-sm text-[#12131C] focus:outline-none focus:ring-2 focus:ring-[#9EA8FB]`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

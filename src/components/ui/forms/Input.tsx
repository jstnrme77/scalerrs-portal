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
        <label className="block text-sm font-medium text-[#4F515E] mb-1">
          {label}
        </label>
      )}

      <input
        className={`w-full border ${error ? 'border-red-500' : 'border-[#D9D9D9]'} rounded-md h-9 px-3 py-2 text-sm text-[#12131C] focus:outline-none focus:ring-2 focus:ring-[#9EA8FB]`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

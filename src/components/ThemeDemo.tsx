'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import ThemeCard from './ThemeCard';

export default function ThemeDemo() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Colors</h2>
        <p className="text-sm text-mediumGray dark:text-gray-300">
          Check the Figma Variables Panel for all color theme values.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dark Theme Example */}
        <ThemeCard theme="dark" />

        {/* Light Theme Example */}
        <ThemeCard theme="light" />
      </div>
    </div>
  );
}

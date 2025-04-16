'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ThemeDemo from '@/components/ThemeDemo';
import ThemeColors from '@/components/ThemeColors';
import ThemeToggleWrapper from '@/components/ThemeToggleWrapper';

export default function ThemeDemoPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Theme Demo</h1>
        <ThemeToggleWrapper />
      </div>

      <div className="bg-white dark:bg-darkGray rounded-scalerrs shadow-sm border border-lightGray dark:border-gray-700 p-6 mb-8">
        <ThemeDemo />
      </div>

      <div className="bg-white dark:bg-darkGray rounded-scalerrs shadow-sm border border-lightGray dark:border-gray-700 p-6 mb-8">
        <ThemeColors />
      </div>

      <div className="bg-white dark:bg-darkGray rounded-scalerrs shadow-sm border border-lightGray dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-dark dark:text-white">Theme Controls</h2>
        <p className="text-mediumGray dark:text-gray-300 mb-4">
          Use the toggle in the top right corner to switch between light and dark themes.
        </p>
        <div className="flex items-center space-x-4">
          <span className="text-mediumGray dark:text-gray-300">Toggle theme:</span>
          <ThemeToggleWrapper />
        </div>
      </div>
    </DashboardLayout>
  );
}

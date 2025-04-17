'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  containerClassName?: string;
}

/**
 * A reusable tab navigation component that provides consistent styling across the application
 */
export default function TabNavigation({
  tabs,
  activeTab,
  onChange,
  variant = 'primary',
  className = '',
  containerClassName = '',
}: TabNavigationProps) {
  // Primary tabs are the main navigation tabs (top level)
  // Secondary tabs are nested tabs (second level)
  const isPrimary = variant === 'primary';

  return (
    <div
      className={cn(
        "tab-navigation",
        containerClassName
      )}
    >
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "tab-item",
              activeTab === tab.id
                ? "tab-item-active"
                : "tab-item-inactive",
              isPrimary ? "font-semibold" : "font-medium",
              tab.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A container component for tab content with consistent styling
 */
export function TabContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-6", className)}>
      {children}
    </div>
  );
}

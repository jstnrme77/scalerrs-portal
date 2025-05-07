'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function DeliverableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize with a full month and year default value
  const [selectedMonth, setSelectedMonth] = useState<string>(`January ${new Date().getFullYear()}`);
  const [onMonthChange, setOnMonthChange] = useState<((month: string) => void) | undefined>(undefined);

  // Listen for the custom event from the page component
  useEffect(() => {
    const handleUpdateTopNavBar = (event: CustomEvent) => {
      const { selectedMonth, onMonthChange } = event.detail;
      if (selectedMonth) setSelectedMonth(selectedMonth);
      if (onMonthChange) setOnMonthChange(() => onMonthChange);
    };

    window.addEventListener('updateTopNavBar', handleUpdateTopNavBar as EventListener);

    return () => {
      window.removeEventListener('updateTopNavBar', handleUpdateTopNavBar as EventListener);
    };
  }, []);

  return (
    <DashboardLayout 
      topNavBarProps={{
        selectedMonth,
        onMonthChange
      }}
    >
      {children}
    </DashboardLayout>
  );
}

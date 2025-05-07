'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import ProtectedRoute from './ProtectedRoute';
import PageWrapper from './PageWrapper';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  topNavBarProps?: {
    selectedMonth?: string;
    onMonthChange?: (month: string) => void;
  };
}

export default function DashboardLayout({
  children,
  topNavBarProps
}: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const pathname = usePathname() || '';

  // Listen for changes in sidebar state
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };

    window.addEventListener('sidebarToggle' as any, handleSidebarChange);

    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarChange);
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-lightGray dark:bg-dark">
        <Sidebar />
        <TopNavBar
          sidebarExpanded={sidebarExpanded}
          pathname={pathname}
          selectedMonth={topNavBarProps?.selectedMonth}
          onMonthChange={topNavBarProps?.onMonthChange}
        />
        <div className={`flex-1 pt-20 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
          <PageWrapper>
            {children}
          </PageWrapper>
        </div>
      </div>
    </ProtectedRoute>
  );
}

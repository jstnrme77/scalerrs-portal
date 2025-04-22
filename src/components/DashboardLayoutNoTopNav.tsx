'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import ProtectedRoute from './ProtectedRoute';

export default function DashboardLayoutNoTopNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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
        {/* TopNavBar is not included here */}
        <main className={`flex-1 pt-0 px-6 pb-6 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

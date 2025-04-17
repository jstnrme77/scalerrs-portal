'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';

export default function DashboardLayout({
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
      <div className="flex min-h-screen bg-[#F5F5F5] dark:bg-dark">
        <Sidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

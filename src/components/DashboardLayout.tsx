'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import ProtectedRoute from './ProtectedRoute';
import PageWrapper from './PageWrapper';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const pathname = usePathname();
  const isHomePage = pathname === '/home';

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
        <TopNavBar sidebarExpanded={sidebarExpanded} />
        <div className={`flex-1 ${isHomePage ? 'pt-20' : 'pt-0'} transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
          <PageWrapper>
            {children}
          </PageWrapper>
        </div>
      </div>
    </ProtectedRoute>
  );
}

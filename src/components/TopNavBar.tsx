'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import RoundedMonthSelector from '@/components/ui/custom/RoundedMonthSelector';

interface TopNavBarProps {
  sidebarExpanded?: boolean;
  pathname?: string;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  onAddTask?: () => void;
}

export default function TopNavBar({
  sidebarExpanded = true,
  pathname = '',
  selectedMonth = `January ${new Date().getFullYear()}`,
  onMonthChange,
  onAddTask
}: TopNavBarProps) {
  // Get current time to determine greeting
  const [greeting, setGreeting] = useState('Good evening');
  const { user } = useAuth();

  // Update greeting based on time of day
  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      setGreeting('Good morning');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/home') {
      return null; // For home page, we'll show the greeting instead
    }

    // Map paths to titles
    const pathTitles: {[key: string]: string} = {
      '/get-started': 'Get Started',
      '/content-workflow': 'Content Workflow',
      '/approvals': 'Approvals',
      '/task-boards': 'Task Boards',
      '/deliverables': 'Deliverables',
      '/reports': 'Reports',
      '/kpi-dashboard': 'KPI Dashboard',
      '/seo-layouts': 'SEO Layouts',
      '/admin': 'Admin'
    };

    // Check for exact path match
    if (pathTitles[pathname]) {
      return pathTitles[pathname];
    }

    // Check for parent path match (for nested routes)
    for (const path in pathTitles) {
      if (pathname.startsWith(path + '/')) {
        return pathTitles[path];
      }
    }

    // Default fallback
    return 'Dashboard';
  };

  const pageTitle = getPageTitle();
  const isHomePage = pathname === '/home';
  const isContentWorkflowPage = pathname === '/content-workflow';
  const isDeliverablesPage = pathname === '/deliverables';
  const isTaskBoardsPage = pathname === '/task-boards';

  // Client name would typically come from a user context or API
  const clientName = user?.Name || '(Client Name)';

  return (
    <div className={`fixed top-0 ${sidebarExpanded ? 'left-64' : 'left-20'} right-0 h-16 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700 z-50 flex justify-between items-center px-6 transition-all duration-300 rounded-none`}>
      <div className="flex items-center">
        {isHomePage ? (
          <h1 className="text-lg font-medium text-[#12131C] dark:text-white">{greeting}, {clientName}</h1>
        ) : (
          <h1 className="text-2xl font-bold text-[#12131C] dark:text-white">{pageTitle}</h1>
        )}
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        {(isContentWorkflowPage || isDeliverablesPage || pathname === '/reports') && onMonthChange && (
          <div className="mr-3">
            <RoundedMonthSelector
              selectedMonth={selectedMonth || 'January'}
              onChange={onMonthChange}
            />
          </div>
        )}

        {isTaskBoardsPage && onAddTask && (
          <button
            onClick={onAddTask}
            className="px-4 py-2 text-base font-medium text-white bg-[#000000] rounded-full hover:bg-[#000000]/80 transition-colors flex items-center task-btn-override"
            style={{ borderRadius: '999px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}

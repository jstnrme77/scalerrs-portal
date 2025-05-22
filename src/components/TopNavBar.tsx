'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import RoundedMonthSelector from '@/components/ui/custom/RoundedMonthSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import ClientSelector from '@/components/ClientSelector';

interface TopNavBarProps {
  sidebarExpanded?: boolean;
  pathname?: string;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  onAddTask?: () => void;
  dateView?: string;
  comparisonPeriod?: string;
  onDateViewChange?: (viewValue: string) => void;
  onComparisonChange?: (comparisonValue: string) => void;
}

export default function TopNavBar({
  sidebarExpanded = true,
  pathname = '',
  selectedMonth,
  onMonthChange,
  onAddTask,
  dateView = 'monthly',
  comparisonPeriod = 'previous-period',
  onDateViewChange,
  onComparisonChange
}: TopNavBarProps) {
  // Get current month and year for default selection if not provided
  const getCurrentMonthYear = () => {
    const date = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  // Use the provided selectedMonth or default to current month
  const effectiveSelectedMonth = selectedMonth || getCurrentMonthYear();
  // Get current time to determine greeting
  const [greeting, setGreeting] = useState('Good evening');
  const { user } = useAuth();

  // Add debug logs to troubleshoot
  useEffect(() => {
    console.log("TopNavBar rendered with pathname:", pathname);
    console.log("isDeliverablesPage:", pathname === '/deliverables');
    console.log("selectedMonth:", selectedMonth);
    console.log("onMonthChange function exists:", !!onMonthChange);
  }, [pathname, selectedMonth, onMonthChange]);

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
  const isKpiDashboardPage = pathname === '/kpi-dashboard';

  // Get the user's name from the auth context
  // For admin@example.com, use "Admin User" as the name
  const userName = user?.Email === 'admin@example.com' ? 'Admin User' : (user?.Name || 'User');

  // Add debug logs to troubleshoot user name
  useEffect(() => {
    if (user) {
      console.log('User object in TopNavBar:', user);
      console.log('User name in TopNavBar:', user.Name);
    } else {
      console.log('No user object in TopNavBar');
    }
  }, [user]);

  return (
    <div className={`fixed top-0 ${sidebarExpanded ? 'left-64' : 'left-20'} right-0 h-16 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700 z-50 flex justify-between items-center px-6 transition-all duration-300 rounded-none`} style={{ zIndex: 9000 }}>
      <div className="flex items-center">
        {isHomePage ? (
          <h1 className="text-lg font-medium text-[#12131C] dark:text-white">{greeting}, {userName}</h1>
        ) : (
          <h1 className="text-2xl font-bold text-[#12131C] dark:text-white">{pageTitle}</h1>
        )}
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        {/* Client selector - will only show for admin users */}
        <ClientSelector className="mr-3" />

        {/* Debug element to show condition values */}
        <div className="hidden">
          isDeliverablesPage: {String(isDeliverablesPage)},
          onMonthChange exists: {String(!!onMonthChange)},
          shouldShow: {String((isContentWorkflowPage || isDeliverablesPage || pathname === '/reports') && !!onMonthChange)}
        </div>

        {(isContentWorkflowPage || isDeliverablesPage || pathname === '/reports') && onMonthChange && (
          <div className="mr-3">
            <RoundedMonthSelector
              selectedMonth={effectiveSelectedMonth}
              onChange={onMonthChange}
            />
          </div>
        )}

        {isKpiDashboardPage && (
          <div className="flex items-center gap-2">
            <Select
              value={dateView}
              onValueChange={(value) => {
                if (onDateViewChange) {
                  onDateViewChange(value);
                }
              }}
            >
              <SelectTrigger className="month-selector-rounded w-[180px] h-9 flex items-center bg-white rounded-lg">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="View">
                  {dateView === 'monthly' ? 'Monthly View' :
                   dateView === 'quarterly' ? 'Quarterly View' :
                   'Yearly View'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="quarterly">Quarterly View</SelectItem>
                <SelectItem value="yearly">Yearly View</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={comparisonPeriod}
              onValueChange={(value) => {
                if (onComparisonChange) {
                  onComparisonChange(value);
                }
              }}
            >
              <SelectTrigger className="month-selector-rounded w-[180px] h-9 flex items-center bg-white rounded-lg">
                <SelectValue placeholder="Comparison">
                  {comparisonPeriod === 'previous-period' ? 'Previous Period' :
                   comparisonPeriod === 'previous-year' ? 'Previous Year' :
                   'Custom Period'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous-period">Previous Period</SelectItem>
                <SelectItem value="previous-year">Previous Year</SelectItem>
                <SelectItem value="custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>

            <button className="month-selector-rounded justify-center rounded-lg font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#12131C] bg-white text-[#12131C] hover:opacity-90 h-10 px-4 py-2 text-sm flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </button>
          </div>
        )}

        {isTaskBoardsPage && onAddTask && (
          <button
            onClick={onAddTask}
            className="px-4 py-1 text-base font-medium text-white bg-[#000000] rounded-lg hover:bg-[#000000]/80 transition-colors flex items-center task-btn-override"
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

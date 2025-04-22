'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface TopNavBarProps {
  sidebarExpanded?: boolean;
}

export default function TopNavBar({ sidebarExpanded = true }: TopNavBarProps) {
  // Get current time to determine greeting
  const [greeting, setGreeting] = useState('Good evening');
  const { user } = useAuth();
  const pathname = usePathname();

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

  // Only show on home page
  const isHomePage = pathname === '/home';

  if (!isHomePage) {
    return null;
  }

  // Client name would typically come from a user context or API
  const clientName = user?.Name || '(Client Name)';

  return (
    <div className={`fixed top-0 ${sidebarExpanded ? 'left-64' : 'left-20'} right-0 h-16 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700 z-10 flex justify-between items-center px-6 transition-all duration-300 rounded-none`}>
      <div className="flex items-center">
        <h1 className="text-lg font-medium text-[#12131C] dark:text-white">{greeting}, {clientName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#12131C] dark:text-white">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        </Link>
        <Link
          href="/help"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#12131C] dark:text-white">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <path d="M12 17h.01"></path>
          </svg>
        </Link>
        <div className="h-8 w-8 rounded-full bg-[#9EA8FB] flex items-center justify-center text-white font-medium">
          {clientName.charAt(0)}
        </div>
      </div>
    </div>
  );
}

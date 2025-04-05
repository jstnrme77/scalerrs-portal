'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggleWrapper from './ThemeToggleWrapper';
import { useState } from 'react';

// Icons for the sidebar
const navItems = [
  { 
    name: 'Home', 
    href: '/home', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  { 
    name: 'Deliverables', 
    href: '/deliverables', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  { 
    name: 'KPI Dashboard', 
    href: '/kpi-dashboard', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  { 
    name: 'Task Boards', 
    href: '/task-boards', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  { 
    name: 'Approvals', 
    href: '/approvals', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  { 
    name: 'Content Workflow', 
    href: '/content-workflow', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  { 
    name: 'Admin', 
    href: '/admin', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Function to check if a nav item is active
  const isNavItemActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/' || pathname === '/home';
    }
    return pathname.startsWith(href);
  };

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Dispatch custom event for DashboardLayout to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sidebarToggle', { 
          detail: { expanded: newExpandedState } 
        })
      );
    }
  };

  return (
    <div 
      className={`flex flex-col ${isExpanded ? 'w-64' : 'w-20'} bg-white dark:bg-dark h-screen fixed left-0 top-0 border-r border-lightGray dark:border-darkGray transition-all duration-300 ease-in-out z-10`}
    >
      <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} h-16 border-b border-lightGray dark:border-darkGray overflow-hidden px-4`}>
        {isExpanded ? (
          <>
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              <span>Scalerrs</span><span className="text-primary text-3xl">.</span> Portal
            </h1>
            <button 
              onClick={toggleSidebar}
              className="text-mediumGray hover:text-dark dark:hover:text-white transition-colors"
              title="Collapse Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-primary">S</h1>
            <button 
              onClick={toggleSidebar}
              className="absolute right-3 text-mediumGray hover:text-dark dark:hover:text-white transition-colors"
              title="Expand Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.href);
              
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center ${isExpanded ? 'px-4' : 'justify-center'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white dark:text-white shadow-md'
                    : 'text-darkGray dark:text-lightGray hover:bg-primary/10 hover:text-primary dark:hover:bg-[#9ea8fb] dark:hover:text-white hover:border-l-4 hover:border-[#5e72e4] hover:shadow-sm'
                }`}
                title={item.name}
              >
                <span className={`${isExpanded ? "mr-3" : ""} transition-transform duration-200 group-hover:scale-110`}>
                  {item.icon}
                </span>
                {isExpanded && <span className="transition-colors duration-200">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-lightGray dark:border-darkGray">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded ? (
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  U
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-dark dark:text-white">User Name</p>
                  <p className="text-xs text-mediumGray dark:text-gray-400">user@company.com</p>
                </div>
              </div>
              <ThemeToggleWrapper />
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              U
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

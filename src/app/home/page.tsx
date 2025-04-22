'use client';

import Link from 'next/link';

export default function Home() {
  // Get current time to determine greeting
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';

  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  }

  // Client name would typically come from a user context or API
  const clientName = '(Client Name)';

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header with greeting */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-text-light dark:text-text-dark">{greeting}, {clientName}</h1>
          <p className="text-mediumGray dark:text-gray-300">Welcome back. Here's where campaign stands this week.</p>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>

      {/* Action Required Alert */}
      <div className="bg-[#ebeeff] border border-[#9ea8fb] rounded-lg p-4 mb-6 relative overflow-hidden">
        <div className="flex items-start">
          <div className="mr-3">
            <span className="inline-flex items-center bg-[#FFF9DB] px-2 py-1 rounded text-sm font-medium !text-[#B45309]" style={{ color: '#B45309' }} id="action-required-label">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full mr-1.5"></span>
              <span style={{ color: '#B45309' }} className="!text-[#B45309]">Action Required</span>
            </span>
          </div>
          <div className="flex-grow">
            <p className="font-medium mb-1">3 deliverables need your review. 1 new report is available.</p>
            <p className="text-sm text-gray-600">Your campaign lead will follow up in Slack if anything is pending.</p>
          </div>
          <div className="ml-4">
            <Link href="/approvals" className="inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
              Go to Approvals
            </Link>
          </div>
        </div>
      </div>

      {/* Main dashboard grid - 2 rows layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Campaign Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Campaign Status</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Approvals Needed */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Approvals Needed</h3>
              <p className="text-gray-600 mb-2">3 items pending</p>
              <div className="text-sm">
                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">2 briefs, 1 keyword plan</span>
              </div>
              <div className="mt-4">
                <Link href="/approvals" className="inline-block px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  View Details
                </Link>
              </div>
            </div>

            {/* Your Campaign */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Your Campaign</h3>
              <p className="text-gray-600 mb-2">SEO + Content</p>
              <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Active
              </div>
              <div className="mt-4">
                <Link href="/campaign" className="inline-block px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
                  Campaign Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Milestone Tracker</h2>
          <p className="mb-2">April Progress:</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '63%' }}></div>
          </div>
          <p className="text-right text-sm text-gray-600 mb-4">63% complete</p>

          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Content */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Content</h3>
              <p className="text-gray-600">6 of 12 briefs delivered</p>
            </div>

            {/* Links */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Links</h3>
              <p className="text-gray-600">4 backlinks, 1 blog live</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/milestones" className="inline-block px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm mr-2">
              View Details
            </Link>
            <Link href="/milestones" className="inline-block px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
              Monthly Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

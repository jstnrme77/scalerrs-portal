'use client';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for the deliverables chart
const deliverableData = [
  { name: '1', value: 6 },
  { name: '2', value: 4 },
  { name: '3', value: 7 },
  { name: '4', value: 8 },
  { name: '5', value: 9 },
];

// Sample data for latest activity
const activityItems = [
  {
    id: 1,
    title: 'Brief: AI CRM guide',
    status: 'sent for review',
    type: 'brief',
  },
  {
    id: 2,
    title: 'Link target list',
    status: 'approved',
    type: 'link',
  },
  {
    id: 3,
    title: 'Keyword cluster 03',
    status: 'awaiting feedback',
    type: 'keyword',
  },
];

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
          <h1 className="text-4xl font-bold mb-2">{greeting}, {clientName}</h1>
          <p className="text-mediumGray">Welcome back. Here's where campaign stands this week.</p>
        </div>
        <Link href="/help" className="flex items-center text-primary hover:underline">
          <span>HELP</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Campaign status summary */}
      <div className="mb-4">
        <p className="text-lg">3 deliverables need your review. 1 new report is available.</p>
        <p className="text-mediumGray">Your campaign lead will follow up in Slack if anything is pending.</p>
      </div>

      {/* Main dashboard grid - 3 columns with auto-sizing rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
        {/* Deliverables Summary */}
        <div className="bg-[#FFF9DB] p-6 rounded-lg flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Deliverables Summary</h2>
          <div className="flex-grow" style={{ minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliverableData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FFD966" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4">6 items delivered | 3 awaiting approval | 3 in progress</p>
          <div className="mt-auto pt-4">
            <Link href="/deliverables" className="inline-block px-4 py-2 bg-white text-[#D4A72C] border border-[#D4A72C] rounded-md hover:bg-[#FFF9DB]/50 transition-colors">
              View All Deliverables
            </Link>
          </div>
        </div>

        {/* Client Actions Needed */}
        <div className="bg-[#F8E8FF] p-6 rounded-lg flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Client Actions Needed</h2>
          <p className="mb-2">3 approvals pending: <span className="font-medium">2 briefs, 1 keyword plan</span></p>
          <div className="mt-auto pt-4">
            <Link href="/approvals" className="inline-block px-4 py-2 bg-white text-[#9C27B0] border border-[#9C27B0] rounded-md hover:bg-[#F8E8FF]/50 transition-colors">
              Jump to Approvals
            </Link>
          </div>
        </div>

        {/* Latest Activity */}
        <div className="bg-[#FFF8E1] p-6 rounded-lg flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Latest Activity</h2>
          <ul className="space-y-4">
            {activityItems.map((item) => (
              <li key={item.id} className="flex items-start">
                <div className="mr-3 mt-1">
                  {item.type === 'brief' && (
                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  )}
                  {item.type === 'link' && (
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                  {item.type === 'keyword' && (
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-mediumGray">{item.status}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <Link href="/activity" className="inline-block px-4 py-2 bg-white text-[#FF9800] border border-[#FF9800] rounded-md hover:bg-[#FFF8E1]/50 transition-colors">
              View Full Timeline
            </Link>
          </div>
        </div>

        {/* Your Campaign */}
        <div className="bg-[#E8F5E9] p-6 rounded-lg flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Your Campaign</h2>
          <p className="font-medium">SEO Management + Content Creation - Link Building</p>
          <p className="text-mediumGray mt-2">Active since Jan 2024</p>
          <div className="mt-auto pt-4">
            <Link href="/campaign" className="inline-block px-4 py-2 bg-white text-[#4CAF50] border border-[#4CAF50] rounded-md hover:bg-[#E8F5E9]/50 transition-colors">
              View Scope & Team
            </Link>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="bg-[#E3F2FD] p-6 rounded-lg flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Milestone Tracker</h2>
          <p className="mb-2">April Progress: 63% complete</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '63%' }}></div>
          </div>
          <p className="mb-1">6 of 12 briefs delivered</p>
          <p className="mb-1">4 backlinks live, 1 blog published</p>
          <div className="mt-auto pt-4">
            <Link href="/milestones" className="inline-block px-4 py-2 bg-white text-[#2196F3] border border-[#2196F3] rounded-md hover:bg-[#E3F2FD]/50 transition-colors">
              View Monthly Plan
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}

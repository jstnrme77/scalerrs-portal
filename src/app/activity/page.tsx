'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

// Sample activity data
const activityItems = [
  {
    id: 1,
    title: 'Brief: AI CRM guide',
    status: 'sent for review',
    type: 'brief',
    date: 'Today, 10:30 AM',
    description: 'New content brief for AI CRM guide has been sent for your review and approval.'
  },
  {
    id: 2,
    title: 'Link target list',
    status: 'approved',
    type: 'link',
    date: 'Today, 9:15 AM',
    description: 'You approved the link target list for April outreach campaign.'
  },
  {
    id: 3,
    title: 'Keyword cluster 03',
    status: 'awaiting feedback',
    type: 'keyword',
    date: 'Yesterday, 4:45 PM',
    description: 'New keyword cluster for product pages is awaiting your feedback.'
  },
  {
    id: 4,
    title: 'Monthly SEO Report',
    status: 'published',
    type: 'report',
    date: 'Yesterday, 2:30 PM',
    description: 'March SEO performance report has been published and is available for viewing.'
  },
  {
    id: 5,
    title: 'Blog post: "10 Ways to Improve Conversion Rates"',
    status: 'published',
    type: 'content',
    date: 'Apr 10, 2024',
    description: 'New blog post has been published to your website.'
  },
  {
    id: 6,
    title: 'Backlink from TechCrunch',
    status: 'acquired',
    type: 'link',
    date: 'Apr 8, 2024',
    description: 'New high-authority backlink has been acquired from TechCrunch.'
  },
  {
    id: 7,
    title: 'Technical SEO audit',
    status: 'completed',
    type: 'technical',
    date: 'Apr 5, 2024',
    description: 'Quarterly technical SEO audit has been completed with 12 recommendations.'
  },
  {
    id: 8,
    title: 'Content calendar for Q2',
    status: 'approved',
    type: 'planning',
    date: 'Apr 1, 2024',
    description: 'You approved the content calendar for Q2 2024.'
  },
];

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/home" className="flex items-center text-primary mb-4 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Activity Timeline</h1>
        <p className="text-mediumGray dark:text-gray-400">Track all campaign activities and updates</p>
      </div>
      
      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              All
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-mediumGray hover:bg-gray-200">
              Content
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-mediumGray hover:bg-gray-200">
              Links
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-mediumGray hover:bg-gray-200">
              Reports
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {activityItems.map((item) => (
            <div key={item.id} className="flex">
              <div className="mr-4">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${
                    item.type === 'brief' ? 'bg-purple-500' :
                    item.type === 'link' ? 'bg-green-500' :
                    item.type === 'keyword' ? 'bg-yellow-500' :
                    item.type === 'report' ? 'bg-blue-500' :
                    item.type === 'content' ? 'bg-pink-500' :
                    item.type === 'technical' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  {activityItems.indexOf(item) !== activityItems.length - 1 && (
                    <div className="absolute top-4 left-1.5 w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                  )}
                </div>
              </div>
              <div className="flex-1 pb-6">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className="text-xs text-mediumGray">{item.date}</span>
                </div>
                <p className="text-sm text-mediumGray mb-2">{item.description}</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.status === 'sent for review' ? 'bg-purple-100 text-purple-800' :
                    item.status === 'approved' ? 'bg-green-100 text-green-800' :
                    item.status === 'awaiting feedback' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'published' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'acquired' ? 'bg-green-100 text-green-800' :
                    item.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                  {(item.status === 'sent for review' || item.status === 'awaiting feedback') && (
                    <button className="ml-3 text-xs text-primary hover:underline">
                      Take Action
                    </button>
                  )}
                  {(item.status === 'published' || item.status === 'completed') && (
                    <button className="ml-3 text-xs text-primary hover:underline">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors">
            Load More
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

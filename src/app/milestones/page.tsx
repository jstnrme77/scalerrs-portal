'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function MilestonesPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/home" className="flex items-center text-primary mb-4 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Campaign Milestones</h1>
        <p className="text-mediumGray dark:text-gray-400">Track progress against your monthly deliverables and goals</p>
      </div>
      
      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">April 2024 Progress</h2>
          <div className="text-right">
            <p className="text-sm text-mediumGray dark:text-gray-400">Month Progress</p>
            <p className="text-2xl font-bold">63%</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '63%' }}></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Content Deliverables</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Content Briefs (6/12)</span>
                  <span>50%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Blog Posts (3/8)</span>
                  <span>38%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Landing Pages (1/2)</span>
                  <span>50%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Link Building</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Backlinks (4/10)</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Guest Posts (1/3)</span>
                  <span>33%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>PR Mentions (2/3)</span>
                  <span>67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

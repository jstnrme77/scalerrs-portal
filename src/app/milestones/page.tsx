'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import useMilestoneData from '@/lib/useMilestoneData';

// Component for individual progress section
interface ProgressSectionProps {
  title: string;
  progress: number;
}

function ProgressSection({ title, progress }: ProgressSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{title} Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MilestonesPage() {
  const { monthProgress, monthName, progressSections, isAllClientsSelected } = useMilestoneData();

  // Convert progress sections object to array and filter out empty ones
  const validSections = Object.entries(progressSections)
    .filter(([_, value]) => typeof value === 'number' && value >= 0)
    .map(([key, value]) => ({ title: key, progress: value }));

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
        {isAllClientsSelected ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-mediumGray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                Select a Specific Client
              </h3>
              <p className="text-mediumGray dark:text-gray-400">
                Milestone progress is tracked per client. Please select a specific client from the dropdown to view their campaign milestones and progress data.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {monthName || 'Loading...'} Progress
              </h2>
              <div className="text-right">
                <p className="text-sm text-mediumGray dark:text-gray-400">Month Progress</p>
                <p className="text-2xl font-bold">
                  {monthProgress !== null ? `${monthProgress}%` : '--'}
                </p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: monthProgress !== null ? `${monthProgress}%` : '0%' }}
              ></div>
            </div>
            
            {validSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {validSections.map((section, index) => (
                  <ProgressSection
                    key={section.title}
                    title={section.title}
                    progress={section.progress}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mediumGray dark:text-gray-400">
                  {monthName ? 'No progress data available for this month.' : 'Loading progress data...'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import {
  Package,
  CheckSquare,
  BarChart3,
  Clock,
  Check,
  FileText
} from 'lucide-react';
import LinkButton from '@/components/ui/forms/LinkButton';
import Button from '@/components/ui/forms/Button';
import { ChecklistModal } from '@/components/ui/modals';
import { useState } from 'react';
import { checklistItems } from './data';
import Link from 'next/link';

export default function Home() {
  // Current month for milestone tracking
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Checklist state and modal state
  const [checklist, setChecklist] = useState(checklistItems);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);

  // Handle checklist item toggle
  const handleChecklistItemToggle = (id: string, completed: boolean) => {
    setChecklist(
      checklist.map(item =>
        item.id === id ? { ...item, completed } : item
      )
    );
  };

  // Calculate checklist progress
  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      {/* Campaign Status Overview */}
      {/* <div className="mb-6">
        <p className="text-lg text-[#12131C] dark:text-gray-300 mb-4">
          Here&apos;s where your campaign stands this week
        </p> */}

        {/* Highlighted Reminders - Priority 1 */}
        {/* <div className="relative overflow-hidden rounded-3xl border-8 border-[#9EA8FB] bg-gradient-to-r from-[#9EA8FB]/10 to-white p-5 shadow-lg">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              <span className="font-bold">1</span> Action Required
            </span>
          </div>
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="mb-2 text-lg font-medium text-[#12131C]">Items Needing Your Attention</h2>
              <p className="text-sm text-[#4F515E]">3 deliverables need your review. 1 new report is available.</p>
            </div>
            <Link href="/approvals" className="btn-primary inline-flex items-center justify-center gap-2 text-base get-started-btn w-full">
              Go to Approvals
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
            <div className="absolute right-4 top-4 h-4 w-4 animate-pulse rounded-full bg-amber-500"></div>
          </div>
        </div>
      </div> */}

      {/* Main Content and Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area - Updated Layout */}
        <div className="lg:w-2/3 flex flex-col gap-6"> 
          {/* 2-column grid for Checklist and Actions Needed cards (Now at the top) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Interactive Checklist - Added from Get Started page */}
            <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20 mr-3">
                  <CheckSquare className="h-6 w-6 text-[#9EA8FB]" />
                </div>
                <h2 className="text-2xl font-bold text-[#12131C]">Interactive Checklist</h2>
              </div>
              <p className="text-base text-[#12131C] mb-4">Track your progress with our interactive checklist.</p>

              <div className="flex-grow flex flex-col items-center justify-center">
                {/* Centered Progress Circle */}
                <div className="relative h-24 w-24 mb-2">
                  {/* Background circle */}
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="stroke-[#F0F0F7] stroke-[8px] fill-none"
                      cx="50"
                      cy="50"
                      r="38"
                    ></circle>
                    <circle
                      className="stroke-[#9EA8FB] stroke-[8px] fill-none get-started-circle"
                      cx="50"
                      cy="50"
                      r="38"
                      strokeDasharray="238.76104167282426"
                      strokeDashoffset={238.76104167282426 - (238.76104167282426 * progressPercentage / 100)}
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#12131C]">{completedCount}/{totalCount}</span>
                  </div>
                </div>
                <p className="text-base text-[#12131C]">Tasks Completed</p>
              </div>

              <div className="mt-auto pt-6">
                <Button
                  variant="primary"
                  className="text-base get-started-btn w-full"
                  onClick={() => setChecklistModalOpen(true)}
                >
                  View Checklist
                </Button>
              </div>
            </div>

            {/* Client Actions Needed Card - Priority 3 */}
            <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20 mr-3">
                  <Package className="h-6 w-6 text-[#9EA8FB]" />
                </div>
                <h2 className="text-2xl font-bold text-[#12131C]">Client Actions Needed</h2>
              </div>
              <p className="text-base text-[#12131C] mb-4">Review items that require your attention.</p>

              <div className="flex-grow flex flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFEACB] mb-2">
                  <Check className="h-8 w-8 text-[#FFA000]" />
                </div>
                <p className="text-lg font-semibold text-[#12131C] mb-1">No pending actions</p>
                <p className="text-sm text-[#4F515E]">All items are up-to-date.</p>
              </div>

              <div className="mt-auto pt-6">
                <LinkButton href="/approvals" variant="primary" className="text-base get-started-btn w-full">
                  View Approvals
                </LinkButton>
              </div>
            </div>
          </div>
          
          {/* Main card for Campaign Progress (Now below the two smaller cards) */}
          <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
            {/* Header for Campaign Progress */}
            <div className="flex items-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20 mr-3">
                <BarChart3 className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#12131C]">Campaign Progress</h2>
                <p className="text-base text-[#4F515E]">Track your monthly campaign milestones and goals</p>
              </div>
            </div>

            {/* Section 1: Monthly Campaign Progress */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#12131C] mb-3">{currentMonth} Campaign Progress</h3>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-[#12131C]">Overall Status:</span>
                <span className="text-sm font-medium text-[#12131C]">63% complete</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2.5 rounded-full bg-[#9EA8FB]" style={{ width: '63%' }}></div>
              </div>
            </div>

            {/* Section 2: Key Metrics (Content & Links) */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#12131C] mb-4">Key Metrics</h3>
              <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6E8FD] mr-4 mt-1 flex-shrink-0">
                      <FileText className="h-5 w-5 text-[#9EA8FB]" />
                  </div>
                  <div>
                      <h4 className="text-lg font-semibold text-[#12131C]">Content & Links</h4>
                      <p className="text-base text-[#4F515E]">6 of 12 briefs delivered</p>
                      <p className="text-base text-[#4F515E]">4 backlinks, 1 blog live</p>
                  </div>
              </div>
            </div>
            
            {/* Updated Action Button to 'View Monthly Plan' */}
            <div className="mt-auto pt-6">
              <LinkButton href="/milestones" variant="primary" className="text-base get-started-btn w-full">
                View Monthly Plan
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Latest Activity Sidebar - Priority 5 */}
        <div className="lg:w-1/3">
          <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm h-full">
            <div className="flex items-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20 mr-3">
                <Clock className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <h2 className="text-2xl font-bold text-[#12131C]">Latest Activity</h2>
            </div>
            <p className="text-base text-[#12131C] mb-4">Recent updates to your campaign</p>

            <div className="space-y-6">
              {/* Recent Briefs */}
              <div className="border-l-4 border-[#9EA8FB] pl-4">
                <h3 className="text-lg font-bold mb-2">Briefs Sent</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Product Comparison Guide</p>
                    <p className="text-sm text-gray-600">Sent 2 days ago</p>
                  </div>
                  <div>
                    <p className="font-medium">SEO Strategy Update</p>
                    <p className="text-sm text-gray-600">Sent 5 days ago</p>
                  </div>
                </div>
              </div>

              {/* Plans Approved */}
              <div className="border-l-4 border-[#9EA8FB] pl-4">
                <h3 className="text-lg font-bold mb-2">Plans Approved</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Q2 Content Calendar</p>
                    <p className="text-sm text-gray-600">Approved yesterday</p>
                  </div>
                  <div>
                    <p className="font-medium">Link Building Strategy</p>
                    <p className="text-sm text-gray-600">Approved last week</p>
                  </div>
                </div>
              </div>

              {/* Feedback Requested */}
              <div className="border-l-4 border-[#9EA8FB] pl-4">
                <h3 className="text-lg font-bold mb-2">Feedback Requested</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Competitor Analysis</p>
                    <p className="text-sm text-gray-600">Awaiting feedback</p>
                  </div>
                  <div>
                    <p className="font-medium">Homepage Copy Draft</p>
                    <p className="text-sm text-gray-600">Awaiting feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Modal */}
      <ChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        title="Onboarding Checklist"
        items={checklist}
        onItemToggle={handleChecklistItemToggle}
      />
    </>
  );
}

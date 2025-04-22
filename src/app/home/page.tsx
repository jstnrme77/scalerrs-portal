'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="space-y-4">
        <p className="text-lg text-[#12131C] dark:text-gray-300">Welcome back. Here's where campaign stands this week.</p>

        {/* Action Required Alert */}
        <div className="relative overflow-hidden rounded-2xl border-8 border-[#9EA8FB] bg-gradient-to-r from-[#9EA8FB]/10 to-white p-5 shadow-lg">
          <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden">
            <div className="absolute top-0 right-0 h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-md bg-amber-100 px-3 py-1.5 text-amber-800 font-medium border border-amber-200 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
                Action Required
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium">3 deliverables need your review. 1 new report is available.</p>
              <p className="text-sm text-[#4F515E]">Your campaign lead will follow up in Slack if anything is pending.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Link href="/approvals" className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#12131C] px-6 py-3 text-base font-bold text-white border border-[#12131C] hover:bg-black/90">
              Go to Approvals
            </Link>
          </div>
        </div>
      </div>

      {/* Main dashboard grid - 2 rows layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Campaign Status */}
        <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col">
          <h2 className="mb-6 text-2xl font-bold">Campaign Status</h2>
          <div className="grid gap-8 md:grid-cols-2 flex-grow">
            {/* Approvals Needed */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-6 w-6 text-[#9EA8FB]">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Approvals Needed</h3>
              <p className="mb-2 text-base">3 items pending</p>
              <div className="mt-2 w-full text-left">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm">2 briefs, 1 keyword plan</span>
                </div>
              </div>
            </div>

            {/* Your Campaign */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target h-6 w-6 text-[#9EA8FB]">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Your Campaign</h3>
              <p className="mb-2 text-base">SEO + Content</p>
              <div className="mt-2">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 flex justify-center gap-3">
            <Link href="/approvals" className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#12131C] bg-white px-6 py-3 text-base font-normal text-[#12131C] hover:bg-gray-50">
              View Details
            </Link>
            <Link href="/campaign" className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#12131C] px-6 py-3 text-base font-bold text-white border border-[#12131C] hover:bg-black/90">
              Campaign Dashboard
            </Link>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col">
          <h2 className="mb-6 text-2xl font-bold">Milestone Tracker</h2>
          <div className="mb-6">
            <div className="flex items-center justify-between text-base mb-2">
              <span className="font-medium">April Progress:</span>
              <span>63% complete</span>
            </div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} className="relative w-full overflow-hidden rounded-full h-2 bg-gray-200">
              <div className="h-full w-full flex-1 bg-blue-500 transition-all" style={{ width: '63%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 flex-grow">
            {/* Content */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-6 w-6 text-amber-500">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                  <path d="M10 9H8"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Content</h3>
              <p className="text-base">6 of 12 briefs delivered</p>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link2 h-6 w-6 text-amber-500">
                  <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                  <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                  <line x1="8" x2="16" y1="12" y2="12"></line>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Links</h3>
              <p className="text-base">4 backlinks, 1 blog live</p>
            </div>
          </div>

          <div className="mt-auto pt-6 flex justify-center gap-3">
            <Link href="/milestones" className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#12131C] bg-white px-6 py-3 text-base font-normal text-[#12131C] hover:bg-gray-50">
              View Details
            </Link>
            <Link href="/milestones" className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#12131C] px-6 py-3 text-base font-bold text-white border border-[#12131C] hover:bg-black/90">
              Monthly Plan
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

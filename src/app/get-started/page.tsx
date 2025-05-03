'use client';

import Link from 'next/link';
import Button from '@/components/ui/forms/Button';

export default function GetStartedPage() {
  return (
    <>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-[#12131C]">Get Started</h1>
          <p className="text-lg text-[#12131C]">Help clients get set up quickly, and learn how to use the portal.</p>

          <div>
            <div className="relative overflow-hidden rounded-2xl border-8 border-[#9EA8FB] bg-gradient-to-r from-[#9EA8FB]/10 to-white p-5 shadow-lg">
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  </span>
                  Action Required
                </span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mb-2 text-lg font-medium text-[#12131C]">Complete Your Onboarding</h2>
                  <p className="text-sm text-[#4F515E]">You have 4 remaining tasks to complete your onboarding process.</p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="ml-4 inline-flex items-center gap-2"
                  onClick={() => console.log('Continue onboarding clicked')}
                >
                  Continue Onboarding
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </div>
              <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                <div className="absolute right-4 top-4 h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
              </div>
            </div>
          </div>

        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-play h-6 w-6 text-[#9EA8FB]">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Loom Walkthrough</h2>
            <p className="mb-6 text-base text-[#12131C]">Learn how to use the platform with our step-by-step video walkthrough.</p>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto inline-flex items-center gap-2"
              onClick={() => console.log('Watch walkthrough clicked')}
            >
              Watch Now
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </div>

          <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-6 w-6 text-[#9EA8FB]">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Onboarding Forms</h2>
            <p className="mb-6 text-base text-[#12131C]">Complete these essential forms to set up your account and customize your experience.</p>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto inline-flex items-center gap-2"
              onClick={() => console.log('Complete forms clicked')}
            >
              Complete Forms
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </div>

          <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-check h-6 w-6 text-[#9EA8FB]">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="m9 15 2 2 4-4"></path>
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Campaign Overview</h2>
            <p className="mb-6 text-base text-[#12131C]">Follow our proven campaign framework to maximize your results and achieve your goals.</p>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto inline-flex items-center gap-2"
              onClick={() => console.log('View campaign roadmap clicked')}
            >
              View Roadmap
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database h-6 w-6 text-[#9EA8FB]">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Service Line Breakdown</h2>
            <p className="mb-4 text-base text-[#12131C]">Explore detailed analytics and insights about your service performance.</p>
            <div className="mb-2 text-sm text-[#4F515E]">Progress: 65%</div>
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-black" style={{ width: '65%' }}></div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto inline-flex items-center gap-2"
              onClick={() => console.log('Explore services clicked')}
            >
              Explore Services
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </div>

          <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Guides &amp; Resources</h2>
            <p className="mb-6 text-base text-[#12131C]">Access our comprehensive library of guidelines and best practices.</p>
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#9EA8FB]/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-4 w-4 text-[#9EA8FB]">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                </div>
                <span className="text-base text-[#12131C]">Content Guidelines</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#9EA8FB]/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-spreadsheet h-4 w-4 text-[#9EA8FB]">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M8 13h2"></path>
                    <path d="M14 13h2"></path>
                    <path d="M8 17h2"></path>
                    <path d="M14 17h2"></path>
                  </svg>
                </div>
                <span className="text-base text-[#12131C]">Link Building Guidelines</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto inline-flex items-center gap-2"
              onClick={() => console.log('Open guides clicked')}
            >
              Open Guides
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </div>

          <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm text-center">
            <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Interactive Checklist</h2>
            <p className="mb-6 text-base text-[#12131C]">Track your progress with our interactive checklist.</p>
            <div className="mx-auto mb-4 relative">
              <div className="h-24 w-24 rounded-full border-4 border-[#9EA8FB]/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#12131C]">2/6</span>
                </div>
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle className="stroke-[#9EA8FB] stroke-[8px] fill-none" cx="50" cy="50" r="38" strokeDasharray="238.76104167282426" strokeDashoffset="159.17402778188287"></circle>
                </svg>
              </div>
            </div>
            <p className="mb-6 text-sm text-[#4F515E]">2 of 6 tasks completed</p>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto inline-flex items-center gap-2"
              onClick={() => console.log('View checklist clicked')}
            >
              Resume Checklist
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </div>
        </div>

    </>
  );
}

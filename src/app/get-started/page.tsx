'use client';

import DashboardLayout from '@/components/DashboardLayout';
import GetStartedCard, { GuideCard, ChecklistCard } from '@/components/ui/cards/GetStartedCard';

export default function GetStartedPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-4xl font-bold mb-2">Get Started</h1>
        <p className="text-lg text-gray-600 mb-8">Help clients get set up quickly, and learn how to use the portal.</p>

        {/* Action Required Banner */}
        <div className="bg-[#ebeeff] border border-[#9ea8fb] rounded-lg p-4 mb-6 relative overflow-hidden">
          <div className="flex items-start">
            <div className="mr-3">
              <span className="inline-flex items-center bg-[#FFF9DB] px-2 py-1 rounded text-sm font-medium !text-[#B45309]" style={{ color: '#B45309' }} id="action-required-label">
                <span className="w-2 h-2 bg-[#F59E0B] rounded-full mr-1.5"></span>
                <span style={{ color: '#B45309' }} className="!text-[#B45309]">Action Required</span>
              </span>
            </div>
            <div className="flex-grow">
              <p className="font-medium mb-1">Complete Your Onboarding</p>
              <p className="text-sm text-gray-600">You have 4 remaining tasks to complete your onboarding process.</p>
            </div>
            <div className="ml-4">
              <button
                className="inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                onClick={() => console.log('Continue onboarding clicked')}
              >
                Continue Onboarding
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loom Walkthrough */}
          <GetStartedCard
            title="Loom Walkthrough"
            bgColor="bg-card-blue"
            buttonText="Watch Now"
            buttonColor="brand-1"
            icon={
              <div className="w-12 h-12 bg-[#e8eeff] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9ea8fb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            description="Learn how to use the platform with our step-by-step video walkthrough."
            onClick={() => console.log('Watch walkthrough clicked')}
          />

          {/* Onboarding Forms */}
          <GetStartedCard
            title="Onboarding Forms"
            bgColor="bg-card-blue"
            buttonText="Complete Forms"
            buttonColor="brand-1"
            icon={
              <div className="w-12 h-12 bg-[#e8eeff] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9ea8fb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            }
            description="Complete these essential forms to set up your account and customize your experience."
            onClick={() => console.log('Complete forms clicked')}
          />

          {/* Campaign Overview */}
          <GetStartedCard
            title="Campaign Overview"
            bgColor="bg-card-blue"
            buttonText="View Roadmap"
            buttonColor="brand-1"
            icon={
              <div className="w-12 h-12 bg-[#e8eeff] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9ea8fb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            }
            description="Follow our proven campaign framework to maximize your results and achieve your goals."
            onClick={() => console.log('View campaign roadmap clicked')}
          />

          {/* Service Line Breakdown */}
          <GetStartedCard
            title="Service Line Breakdown"
            bgColor="bg-card-blue"
            buttonText="Explore Services"
            buttonColor="brand-1"
            icon={
              <div className="w-12 h-12 bg-[#e8eeff] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9ea8fb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            }
            description="Explore detailed analytics and insights about your service performance."
            onClick={() => console.log('Explore services clicked')}
          />

          {/* Guides & Resources */}
          <GuideCard
            title="Guides & Resources"
            bgColor="bg-card-blue"
            buttonText="Browse Guides"
            description="Access our comprehensive library of guidelines and best practices."
            onClick={() => console.log('Open guides clicked')}
            items={[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                text: "Content Guidelines",
                bgColor: "bg-brand-1-icon"
              }
            ]}
          />

          {/* Interactive Checklist */}
          <ChecklistCard
            title="Interactive Checklist"
            bgColor="bg-card-blue"
            completedTasks={2}
            totalTasks={6}
            buttonText="View Checklist"
            description="Track your progress with our interactive checklist."
            onClick={() => console.log('View checklist clicked')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

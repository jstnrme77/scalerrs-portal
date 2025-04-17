'use client';

import DashboardLayout from '@/components/DashboardLayout';
import GetStartedCard, { GuideCard, QuickLinksCard } from '@/components/ui/cards/GetStartedCard';

export default function GetStartedPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-4xl font-bold mb-2">Get Started</h1>
        <p className="text-lg text-gray-600 mb-8">Help clients get set up quickly, and learn how to use the portal.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loom Walkthrough */}
          <GetStartedCard
            title="Loom Walkthrough"
            bgColor="bg-card-yellow"
            buttonText="Watch the walkthrough"
            buttonColor="brand-1"
            icon={
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            onClick={() => console.log('Watch walkthrough clicked')}
          />

          {/* Onboarding Forms */}
          <GetStartedCard
            title="Onboarding Forms"
            bgColor="bg-card-yellow"
            buttonText="Complete Forms"
            buttonColor="brand-1"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="var(--brand-1)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            onClick={() => console.log('Complete forms clicked')}
          />

          {/* Step-by-Step Campaign Overview */}
          <GetStartedCard
            title="Step-by-Step Campaign Overview"
            bgColor="bg-card-yellow"
            buttonText="View Campaign Roadmap"
            buttonColor="brand-1"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="var(--brand-1)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
            onClick={() => console.log('View campaign roadmap clicked')}
          />

          {/* Service Line Breakdown */}
          <GetStartedCard
            title="Service Line Breakdown"
            bgColor="bg-card-blue"
            buttonText="Explore My Services"
            buttonColor="brand-1"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="var(--brand-1)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            }
            onClick={() => console.log('Explore services clicked')}
          />

          {/* Guides */}
          <GuideCard
            title="Guides"
            bgColor="bg-card-blue"
            items={[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                text: "Content Guidelines",
                bgColor: "bg-brand-1-icon"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                text: "Link Building Guidelines",
                bgColor: "bg-brand-1-icon"
              }
            ]}
          />

          {/* Guides (Detailed) */}
          <GuideCard
            title="Guides"
            bgColor="bg-card-blue"
            items={[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                text: "Content Guidelines",
                bgColor: "bg-brand-1-icon"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                text: "Link Building Guidelines",
                bgColor: "bg-brand-1-icon"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
                text: "Resume Checklist",
                bgColor: "bg-brand-1-icon"
              }
            ]}
          />

          {/* Quick Links */}
          <QuickLinksCard
            title="Quick Links"
            bgColor="bg-card-purple"
            links={[
              {
                icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
                href: "https://slack.com",
                isExternal: true
              },
              {
                icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
                href: "https://drive.google.com",
                isExternal: true
              },
              {
                icon: (
                  <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ),
                href: "/account"
              }
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

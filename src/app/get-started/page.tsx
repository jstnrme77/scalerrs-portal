'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import Image from 'next/image';

export default function GetStartedPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-4xl font-bold mb-2">Get Started</h1>
        <p className="text-lg text-gray-600 mb-8">Help clients get set up quickly, and learn how to use the portal.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loom Walkthrough */}
          <div className="bg-[#FFF9DB] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Loom Walkthrough</h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <button className="px-4 py-2 bg-white text-[#D4A72C] border border-[#D4A72C] rounded-md hover:bg-[#FFF9DB]/50 transition-colors">
                Watch the walkthrough
              </button>
            </div>
          </div>

          {/* Onboarding Forms */}
          <div className="bg-[#FFF9DB] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Onboarding Forms</h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#D4A72C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <button className="px-4 py-2 bg-white text-[#D4A72C] border border-[#D4A72C] rounded-md hover:bg-[#FFF9DB]/50 transition-colors">
                Complete Forms
              </button>
            </div>
          </div>

          {/* Step-by-Step Campaign Overview */}
          <div className="bg-[#FFECF0] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Step-by-Step Campaign Overview</h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#F06292]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <button className="px-4 py-2 bg-white text-[#F06292] border border-[#F06292] rounded-md hover:bg-[#FFECF0]/50 transition-colors">
                View Campaign Roadmap
              </button>
            </div>
          </div>

          {/* Service Line Breakdown */}
          <div className="bg-[#E8F5E9] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Service Line Breakdown</h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <button className="px-4 py-2 bg-white text-[#4CAF50] border border-[#4CAF50] rounded-md hover:bg-[#E8F5E9]/50 transition-colors">
                Explore My Services
              </button>
            </div>
          </div>

          {/* Guides */}
          <div className="bg-[#E8EAF6] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Guides</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#9FA8DA] rounded flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span>Content Guidelines</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#B39DDB] rounded flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span>Link Building Guidelines</span>
              </div>
            </div>
          </div>

          {/* Guides (Detailed) */}
          <div className="bg-[#E3F2FD] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Guides</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#90CAF9] rounded flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span>Content Guidelines</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#90CAF9] rounded flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span>Link Building Guidelines</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#90CAF9] rounded flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span>Resume Checklist</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#EDE7F6] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="flex justify-center space-x-8 py-4">
              <a href="https://slack.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" alt="Slack" className="h-12 w-12" />
              </a>
              <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Google Drive" className="h-12 w-12" />
              </a>
              <a href="/account" className="flex items-center justify-center">
                <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function CampaignPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/home" className="flex items-center text-primary mb-4 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Campaign Details</h1>
        <p className="text-mediumGray dark:text-gray-400">View your campaign scope, team, and timeline</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray mb-6">
            <h2 className="text-xl font-bold mb-4">Campaign Overview</h2>
            <div className="mb-4">
              <h3 className="font-medium mb-1">Campaign Type</h3>
              <p className="text-mediumGray dark:text-gray-400">SEO Management + Content Creation - Link Building</p>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-1">Start Date</h3>
              <p className="text-mediumGray dark:text-gray-400">January 15, 2024</p>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-1">Contract Duration</h3>
              <p className="text-mediumGray dark:text-gray-400">12 months (Renews January 2025)</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Primary Goals</h3>
              <ul className="list-disc pl-5 text-mediumGray dark:text-gray-400">
                <li>Increase organic traffic by 50%</li>
                <li>Improve keyword rankings for 25 target terms</li>
                <li>Generate 20% more leads from organic search</li>
                <li>Establish topical authority in industry niche</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray">
            <h2 className="text-xl font-bold mb-4">Monthly Deliverables</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-lightGray dark:border-darkGray">
                <span className="font-medium">Content Briefs</span>
                <span>4 per month</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-lightGray dark:border-darkGray">
                <span className="font-medium">Blog Posts</span>
                <span>4 per month</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-lightGray dark:border-darkGray">
                <span className="font-medium">Backlinks</span>
                <span>5 per month</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-lightGray dark:border-darkGray">
                <span className="font-medium">Technical SEO Audits</span>
                <span>1 per quarter</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Performance Reports</span>
                <span>Monthly</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray mb-6">
            <h2 className="text-xl font-bold mb-4">Your Team</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                  JD
                </div>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-sm text-mediumGray dark:text-gray-400">Account Manager</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white mr-3">
                  MS
                </div>
                <div>
                  <p className="font-medium">Mike Smith</p>
                  <p className="text-sm text-mediumGray dark:text-gray-400">SEO Strategist</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#FF9800] flex items-center justify-center text-white mr-3">
                  AJ
                </div>
                <div>
                  <p className="font-medium">Alex Johnson</p>
                  <p className="text-sm text-mediumGray dark:text-gray-400">Content Manager</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#9C27B0] flex items-center justify-center text-white mr-3">
                  RB
                </div>
                <div>
                  <p className="font-medium">Rachel Brown</p>
                  <p className="text-sm text-mediumGray dark:text-gray-400">Link Building Specialist</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray">
            <h2 className="text-xl font-bold mb-4">Need Help?</h2>
            <p className="text-mediumGray dark:text-gray-400 mb-4">Have questions about your campaign or need to make adjustments?</p>
            <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Contact Your Account Manager
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

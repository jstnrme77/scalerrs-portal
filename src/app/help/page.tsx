'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import Button from '@/components/ui/forms/Button';

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/home" className="flex items-center text-primary mb-4 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Help Center</h1>
        <p className="text-mediumGray dark:text-gray-400">Find answers to common questions and learn how to use the portal</p>
      </div>

      <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-lightGray dark:border-darkGray">
        <h2 className="text-xl font-bold mb-4">How can we help you?</h2>
        <p className="mb-6">Browse through our help topics or contact your account manager for personalized assistance.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-lightGray dark:border-darkGray rounded-lg p-4">
            <h3 className="font-medium mb-2">Getting Started</h3>
            <p className="text-sm text-mediumGray dark:text-gray-400 mb-2">Learn the basics of navigating and using the portal</p>
            <Button variant="tertiary" className="text-sm p-0">View Guide</Button>
          </div>

          <div className="border border-lightGray dark:border-darkGray rounded-lg p-4">
            <h3 className="font-medium mb-2">Approvals Process</h3>
            <p className="text-sm text-mediumGray dark:text-gray-400 mb-2">Understand how to review and approve deliverables</p>
            <Button variant="tertiary" className="text-sm p-0">View Guide</Button>
          </div>

          <div className="border border-lightGray dark:border-darkGray rounded-lg p-4">
            <h3 className="font-medium mb-2">Reading Reports</h3>
            <p className="text-sm text-mediumGray dark:text-gray-400 mb-2">How to interpret your SEO performance reports</p>
            <Button variant="tertiary" className="text-sm p-0">View Guide</Button>
          </div>

          <div className="border border-lightGray dark:border-darkGray rounded-lg p-4">
            <h3 className="font-medium mb-2">Contact Support</h3>
            <p className="text-sm text-mediumGray dark:text-gray-400 mb-2">Get in touch with your account manager</p>
            <Button variant="tertiary" className="text-sm p-0">Contact Us</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-primary">Scalerrs</span> Client Portal
        </h1>
        <p className="text-mediumGray max-w-2xl mx-auto mb-8">
          Your centralized hub for SEO campaign management, reporting, and collaboration
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/deliverables" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Enter Portal
          </Link>
          <Link href="/kpi-dashboard" className="px-6 py-3 border border-lightGray text-darkGray rounded-lg hover:bg-lightGray transition-colors">
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Powerful SEO Management Tools</h2>
        <p className="text-center text-mediumGray mb-12">Everything you need to track, manage, and optimize your SEO campaigns in one place</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task Boards */}
          <div className="bg-white dark:bg-dark p-6 rounded-scalerrs shadow-sm border border-lightGray dark:border-darkGray">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Task Boards</h3>
            <p className="text-mediumGray mb-4">Manage and track technical SEO, content, and CRO tasks with collaborative Kanban-style boards</p>
            <Link href="/task-boards" className="text-primary flex items-center text-sm font-medium hover:underline">
              View Task Boards
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Comprehensive Reports */}
          <div className="bg-white dark:bg-dark p-6 rounded-scalerrs shadow-sm border border-lightGray dark:border-darkGray">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Comprehensive Reports</h3>
            <p className="text-mediumGray mb-4">Access weekly, monthly, and quarterly performance reports with detailed analytics and actionable insights</p>
            <Link href="/reports" className="text-primary flex items-center text-sm font-medium hover:underline">
              View Reports
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Streamlined Approvals */}
          <div className="bg-white dark:bg-dark p-6 rounded-scalerrs shadow-sm border border-lightGray dark:border-darkGray">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Streamlined Approvals</h3>
            <p className="text-mediumGray mb-4">Efficiently manage and approve keywords, target pages, content briefs, and other deliverables</p>
            <Link href="/approvals" className="text-primary flex items-center text-sm font-medium hover:underline">
              View Approvals
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Live Dashboard */}
          <div className="bg-white dark:bg-dark p-6 rounded-scalerrs shadow-sm border border-lightGray dark:border-darkGray">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Live Dashboard</h3>
            <p className="text-mediumGray mb-4">Track your SEO performance metrics and deliverables in real-time with interactive charts and KPI tracking</p>
            <Link href="/kpi-dashboard" className="text-primary flex items-center text-sm font-medium hover:underline">
              View Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Content Workflow */}
          <div className="bg-white dark:bg-dark p-6 rounded-scalerrs shadow-sm border border-lightGray dark:border-darkGray">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Content Workflow</h3>
            <p className="text-mediumGray mb-4">Track content from brief to publication with a visual workflow showing progress at each stage</p>
            <Link href="/content-workflow" className="text-primary flex items-center text-sm font-medium hover:underline">
              View Content Workflow
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Admin Settings */}
          <div className="bg-white dark:bg-dark p-6 rounded-scalerrs shadow-sm border border-lightGray dark:border-darkGray">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Admin Settings</h3>
            <p className="text-mediumGray mb-4">Manage agreements, team access, educational resources, and account settings in one place</p>
            <Link href="/admin" className="text-primary flex items-center text-sm font-medium hover:underline">
              View Admin
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

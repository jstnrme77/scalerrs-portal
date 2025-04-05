import Link from 'next/link';
import Image from 'next/image';
import ThemeToggleWrapper from '@/components/ThemeToggleWrapper';
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the home page within the dashboard layout
  redirect('/home');
  
  // The code below will not be executed due to the redirect
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-lightGray dark:from-dark dark:to-darkGray">
      {/* Header with theme toggle */}
      <header className="w-full p-4 flex justify-end">
        <ThemeToggleWrapper />
      </header>
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-20 pb-16 px-4">
        <div className="text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark dark:text-white mb-6">
            Welcome to <span className="text-primary">Scalerrs</span> Client Portal
          </h1>
          <p className="text-xl text-mediumGray dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your centralized hub for SEO campaign management, reporting, and collaboration
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link 
              href="/deliverables" 
              className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-scalerrs transition-colors shadow-lg hover:shadow-xl"
            >
              Enter Portal
            </Link>
            <Link 
              href="/kpi-dashboard" 
              className="inline-block bg-white hover:bg-gray-50 text-primary border border-primary font-medium py-3 px-8 rounded-scalerrs transition-colors shadow-lg hover:shadow-xl"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark dark:text-white mb-3">Powerful SEO Management Tools</h2>
          <p className="text-mediumGray dark:text-gray-300 max-w-2xl mx-auto">Everything you need to track, manage, and optimize your SEO campaigns in one place</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature card 1 */}
          <div className="bg-white dark:bg-darkGray p-8 rounded-scalerrs shadow-md border border-lightGray dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">Task Boards</h3>
            <p className="text-mediumGray dark:text-gray-300 mb-4">Manage and track technical SEO, content, and CRO tasks with collaborative Kanban-style boards</p>
            <Link href="/task-boards" className="text-primary font-medium hover:underline flex items-center">
              View Task Boards
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Feature card 2 */}
          <div className="bg-white dark:bg-darkGray p-8 rounded-scalerrs shadow-md border border-lightGray dark:border-gray-700 hover:border-gold hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">Comprehensive Reports</h3>
            <p className="text-mediumGray dark:text-gray-300 mb-4">Access weekly, monthly, and quarterly performance reports with detailed analytics and actionable insights</p>
            <Link href="/reports" className="text-gold font-medium hover:underline flex items-center">
              View Reports
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Feature card 3 */}
          <div className="bg-white dark:bg-darkGray p-8 rounded-scalerrs shadow-md border border-lightGray dark:border-gray-700 hover:border-lavender hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-lavender/10 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-lavender" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">Streamlined Approvals</h3>
            <p className="text-mediumGray dark:text-gray-300 mb-4">Efficiently manage and approve keywords, target pages, content briefs, and other deliverables</p>
            <Link href="/approvals" className="text-lavender font-medium hover:underline flex items-center">
              View Approvals
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Feature card 4 */}
          <div className="bg-white dark:bg-darkGray p-8 rounded-scalerrs shadow-md border border-lightGray dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">Live Dashboard</h3>
            <p className="text-mediumGray dark:text-gray-300 mb-4">Track your SEO performance metrics and deliverables in real-time with interactive charts and KPI tracking</p>
            <Link href="/kpi-dashboard" className="text-primary font-medium hover:underline flex items-center">
              View Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Feature card 5 */}
          <div className="bg-white dark:bg-darkGray p-8 rounded-scalerrs shadow-md border border-lightGray dark:border-gray-700 hover:border-gold hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">Content Workflow</h3>
            <p className="text-mediumGray dark:text-gray-300 mb-4">Track content from brief to publication with a visual workflow showing progress at each stage</p>
            <Link href="/content-workflow" className="text-gold font-medium hover:underline flex items-center">
              View Content Workflow
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Feature card 6 */}
          <div className="bg-white dark:bg-darkGray p-8 rounded-scalerrs shadow-md border border-lightGray dark:border-gray-700 hover:border-lavender hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-lavender/10 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-lavender" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">Admin Settings</h3>
            <p className="text-mediumGray dark:text-gray-300 mb-4">Manage agreements, team access, educational resources, and account settings in one place</p>
            <Link href="/admin" className="text-lavender font-medium hover:underline flex items-center">
              View Admin
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Testimonial Section */}
      <div className="w-full bg-white dark:bg-dark py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dark dark:text-white mb-3">Trusted by Leading Brands</h2>
            <p className="text-mediumGray dark:text-gray-300 max-w-2xl mx-auto">See why companies choose Scalerrs for their SEO success</p>
          </div>
          
          <div className="bg-lightGray dark:bg-darkGray p-8 rounded-scalerrs shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white dark:bg-darkGray rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <blockquote className="text-lg italic text-dark dark:text-white mb-4">
                  "The Scalerrs portal has transformed how we manage our SEO campaigns. The real-time dashboards and streamlined approval process have saved us countless hours and improved our results dramatically."
                </blockquote>
                <div className="font-medium text-dark dark:text-white">Sarah Johnson</div>
                <div className="text-sm text-mediumGray dark:text-gray-400">Marketing Director, Acme Corporation</div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              href="/deliverables" 
              className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-4 px-10 rounded-scalerrs transition-colors shadow-lg hover:shadow-xl text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-400">&copy; 2025 Scalerrs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

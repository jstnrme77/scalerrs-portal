'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/forms/Button';
import {
  VideoModal,
  FormModal,
  ChecklistModal,
  EnhancedRoadmapModal
} from '@/components/ui/modals';
import QuickAccessLinks from '@/components/ui/QuickAccessLinks';
import { useClientData } from '@/context/ClientDataContext';

import {
  FileText,
  FileCheck,
  MessageSquare,
  FolderOpen,
  BarChart3,
  CheckSquare,
  Youtube,
  ArrowRight
} from 'lucide-react';

import {
  checklistItems,
  roadmapSteps
} from './data';

export default function GetStartedPage() {
  const { clientId, isLoading: isClientLoading } = useClientData();
  
  // Modal states
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [howWeWorkVideoModalOpen, setHowWeWorkVideoModalOpen] = useState(false);
  const [redditVideoModalOpen, setRedditVideoModalOpen] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState(checklistItems);

  const [clientLinks, setClientLinks] = useState<{ 
    slackUrl: string | null; 
    googleDriveUrl: string | null;
  }>({
    slackUrl: null,
    googleDriveUrl: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if client data isn't loaded yet
    if (isClientLoading) {
      console.log('Client data still loading, delaying fetch');
      return;
    }

    console.log("GetStartedPage: clientId from context:", clientId);
    if (clientId && clientId !== 'all') {
      // Fetch client links
      fetchClientLinks(clientId);
    } else {
      console.warn("GetStartedPage: No valid clientId found in context.");
      setIsLoading(false);
    }
  }, [clientId, isClientLoading]);

  // Function to fetch client links
  const fetchClientLinks = async (clientId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients/${clientId}/links`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch client links: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("GetStartedPage: Client links fetched:", data);
      
      setClientLinks({
        slackUrl: data.slackUrl,
        googleDriveUrl: data.googleDriveUrl
      });
    } catch (error) {
      console.error("GetStartedPage: Error fetching client links:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Create quick access links with proper React node icons
  const quickLinks = [
    {
      id: 'dashboard',
      icon: <BarChart3 size={20} className="text-[#9EA8FB]" />,
      label: 'Reporting Dashboard',
      url: '/kpi-dashboard'
    },
    {
      id: 'drive',
      icon: <FolderOpen size={20} className="text-[#9EA8FB]" />,
      label: 'Google Drive',
      url: clientLinks.googleDriveUrl || 'https://drive.google.com'
    },
    {
      id: 'slack',
      icon: <MessageSquare size={20} className="text-[#9EA8FB]" />,
      label: 'Slack',
      url: clientLinks.slackUrl || 'https://slack.com'
    }
  ];

  // Video URLs
  const platformWalkthroughUrl = "https://www.tella.tv/video/cm8yl8a5i00160bl7glvn57vg/embed?b=0&title=0&a=1&loop=0&t=0&muted=0&wt=0";
  const howWeWorkVideoUrl = platformWalkthroughUrl; // Using the same video as a placeholder
  const redditExplainerUrl = "https://www.loom.com/embed/4c4e3782582f4b25bbefa9c36b89e061"; // Using a placeholder Loom URL

  return (
    <div>
      {/* Video Walkthrough - Embedded at the top */}
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#12131C] mb-4">Welcome to Scalerrs Portal</h2>
        <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden border-8 border-[#F5F5F9] shadow-md">
          <iframe
            src={platformWalkthroughUrl}
            className="w-full h-full border-0"
            title="Platform Walkthrough"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        </div>
        <p className="mt-3 text-base text-[#4F515E]">Watch our platform walkthrough video</p>
      </div>

      {/* Quick Access Links */}
      <QuickAccessLinks links={quickLinks} />

      {/* First row of cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Quick Start Guide Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <FileText className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Quick Start Guide</h2>
          <p className="mb-6 text-base text-[#12131C]">Get up to speed quickly with our essential tips and platform overview.</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => {
              window.open("https://www.tella.tv/video/cm8yl8a5i00160bl7glvn57vg/embed?b=0&title=0&a=1&loop=0&t=0&muted=0&wt=0", "_blank", "noopener,noreferrer");
            }}
          >
            View Quick Start Guide
          </Button>
        </div>

        {/* Interactive Checklist - Moved to first row */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <CheckSquare className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Interactive Checklist</h2>
          <p className="mb-6 text-base text-[#12131C]">Track your progress with our interactive checklist.</p>

          {/* Progress Circle */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative h-24 w-24">
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
            <p className="mt-3 text-sm text-[#4F515E]">{completedCount} of {totalCount} tasks completed</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => setChecklistModalOpen(true)}
          >
            Resume Checklist
          </Button>
        </div>

        {/* Campaign Roadmap Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <FileCheck className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Campaign Roadmap</h2>
          <p className="mb-6 text-base text-[#12131C]">Follow our proven campaign framework to maximize your results and achieve your goals.</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => setRoadmapModalOpen(true)}
          >
            View Campaign Roadmap
          </Button>
        </div>
      </div>

      {/* Second row of cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Guides Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm get-started-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <FileText className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Guides &amp; Resources</h2>
          <p className="mb-6 text-base text-[#12131C]">Access our comprehensive library of guidelines and best practices.</p>
          <div className="mb-6 space-y-4">
            <a
              href="https://scalerrs.notion.site/Content-Guidelines-137a627a1323816db2d2cd79d749c872"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#9EA8FB]/20">
                <FileText className="h-4 w-4 text-[#9EA8FB]" />
              </div>
              <span className="text-base text-[#12131C]">Content Guidelines</span>
            </a>
            <a
              href="https://scalerrs.notion.site/Onboarding-Info-137a627a1323814f9150eaa469e0f1d3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#9EA8FB]/20">
                <FileText className="h-4 w-4 text-[#9EA8FB]" />
              </div>
              <span className="text-base text-[#12131C]">Onboarding Info</span>
            </a>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => {
              window.open("https://scalerrs.notion.site/Onboarding-Info-137a627a1323814f9150eaa469e0f1d3", "_blank", "noopener,noreferrer");
            }}
          >
            Open Guides
          </Button>
        </div>

        {/* Onboarding Forms Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <FileText className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Onboarding Forms</h2>
          <p className="mb-6 text-base text-[#12131C]">Complete these essential forms to set up your account and customize your experience.</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => {
                if (clientId) {
                    setFormModalOpen(true);
                } else {
                    alert('Client ID not found. Cannot open onboarding form.');
                    console.error("GetStartedPage: Cannot open FormModal, clientId is not set.");
                }
            }}
          >
            Complete Forms
          </Button>
        </div>

        {/* How We Work Video Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <Youtube className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">How We Work</h2>
          <p className="mb-6 text-base text-[#12131C]">Watch our explainer video to understand our process and methodology.</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => setHowWeWorkVideoModalOpen(true)}
          >
            Watch Video
          </Button>
        </div>
      </div>

      {/* Third row of cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Reddit Workflow Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <MessageSquare className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Reddit Workflow</h2>
          <p className="mb-6 text-base text-[#12131C]">Learn how our Reddit engagement process works from keyword to comments.</p>
          
          {/* Reddit Flow Diagram - Simplified for card size */}
          <div className="mb-6 flex flex-col space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#9EA8FB]/20">
                <span className="text-xs font-bold text-[#9EA8FB]">1</span>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium">Keywords</span>
                <p className="text-xs text-[#4F515E]">Research & selection</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
                <div className="h-6 w-0.5 bg-[#9EA8FB]"></div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#9EA8FB]/20">
                <span className="text-xs font-bold text-[#9EA8FB]">2</span>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium">Threads</span>
                <p className="text-xs text-[#4F515E]">Creation & approval</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
                <div className="h-6 w-0.5 bg-[#9EA8FB]"></div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#9EA8FB]/20">
                <span className="text-xs font-bold text-[#9EA8FB]">3</span>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium">Comments</span>
                <p className="text-xs text-[#4F515E]">Engagement & monitoring</p>
              </div>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            className="mt-auto get-started-btn"
            onClick={() => setRedditVideoModalOpen(true)}
          >
            Watch Explainer
          </Button>
        </div>
      </div>

      {/* Modals */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={platformWalkthroughUrl}
        title="Platform Walkthrough"
      />

      <FormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        filloutId="utTZkyHh2cus"
        clientId={clientId}
        title="Onboarding Forms"
      />

      <EnhancedRoadmapModal
        isOpen={roadmapModalOpen}
        onClose={() => setRoadmapModalOpen(false)}
        title="Campaign Roadmap"
        steps={roadmapSteps}
      />

      <ChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        title="Onboarding Checklist"
        items={checklist}
        onItemToggle={handleChecklistItemToggle}
      />

      {/* How We Work Video Modal */}
      <VideoModal
        isOpen={howWeWorkVideoModalOpen}
        onClose={() => setHowWeWorkVideoModalOpen(false)}
        videoUrl={howWeWorkVideoUrl}
        title="How We Work"
      />

      {/* Reddit Explainer Video Modal */}
      <VideoModal
        isOpen={redditVideoModalOpen}
        onClose={() => setRedditVideoModalOpen(false)}
        videoUrl={redditExplainerUrl}
        title="Reddit Workflow Explainer"
      />
    </div>
  );
}
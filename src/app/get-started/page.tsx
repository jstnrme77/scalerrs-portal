'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/forms/Button';
import {
  VideoModal,
  FormModal,
  RoadmapModal,
  ServicesModal,
  GuidesModal,
  ChecklistModal
} from '@/components/ui/modals';
import QuickAccessLinks from '@/components/ui/QuickAccessLinks';
import {
  CirclePlay,
  FileText,
  FileCheck,
  Database,
  FileSpreadsheet,
  Slack,
  FolderOpen,
  BarChart3
} from 'lucide-react';

import {
  checklistItems,
  roadmapSteps,
  servicesTabs,
  guides,
  quickAccessLinks
} from './data';

export default function GetStartedPage() {
  // Modal states
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [guidesModalOpen, setGuidesModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(guides[0]);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState(checklistItems);

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

  // Quick access links with icons
  const quickLinks = quickAccessLinks.map(link => ({
    ...link,
    icon: link.icon === 'slack' ? <Slack size={20} /> :
          link.icon === 'folder' ? <FolderOpen size={20} /> :
          <BarChart3 size={20} />
  }));

  return (
    <div>
      {/* First row of cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Loom Walkthrough Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <CirclePlay className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Loom Walkthrough</h2>
          <p className="mb-6 text-base text-[#12131C]">Learn how to use the platform with our step-by-step video walkthrough.</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto inline-flex items-center gap-2 get-started-btn"
            onClick={() => setVideoModalOpen(true)}
          >
            Watch the walkthrough
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
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
            className="mt-auto inline-flex items-center gap-2 get-started-btn"
            onClick={() => setFormModalOpen(true)}
          >
            Complete Forms
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
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
            className="mt-auto inline-flex items-center gap-2 get-started-btn"
            onClick={() => setRoadmapModalOpen(true)}
          >
            View Campaign Roadmap
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>
      </div>

      {/* Second row of cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Service Line Breakdown */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20">
            <Database className="h-6 w-6 text-[#9EA8FB]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Service Line Breakdown</h2>
          <p className="mb-4 text-base text-[#12131C]">Explore detailed analytics and insights about your service performance.</p>
          <div className="mb-2 text-sm text-[#4F515E]">Progress: 65%</div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 get-started-progress">
            <div className="h-full bg-[#9EA8FB]" style={{ width: '65%' }}></div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto inline-flex items-center gap-2 get-started-btn"
            onClick={() => setServicesModalOpen(true)}
          >
            Explore My Services
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>

        {/* Guides Section */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm get-started-card">
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Guides &amp; Resources</h2>
          <p className="mb-6 text-base text-[#12131C]">Access our comprehensive library of guidelines and best practices.</p>
          <div className="mb-6 space-y-4">
            {guides.slice(0, 2).map((guide) => (
              <div
                key={guide.id}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  setSelectedGuide(guide);
                  setGuidesModalOpen(true);
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#9EA8FB]/20">
                  <FileText className="h-4 w-4 text-[#9EA8FB]" />
                </div>
                <span className="text-base text-[#12131C]">{guide.title}</span>
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-auto inline-flex items-center gap-2 get-started-btn"
            onClick={() => {
              setSelectedGuide(guides[0]);
              setGuidesModalOpen(true);
            }}
          >
            Open Guides
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>

        {/* Interactive Checklist */}
        <div className="flex flex-col rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm text-center">
          <h2 className="mb-2 text-2xl font-bold text-[#12131C]">Interactive Checklist</h2>
          <p className="mb-6 text-base text-[#12131C]">Track your progress with our interactive checklist.</p>

          {/* Centered Progress Circle */}
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
            className="mt-auto inline-flex items-center gap-2 get-started-btn"
            onClick={() => setChecklistModalOpen(true)}
          >
            Resume Checklist
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>
      </div>

      {/* Quick Access Links */}
      <QuickAccessLinks links={quickLinks} />

      {/* Modals */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl="https://www.loom.com/embed/3bfa83acc9fd41b7b98b803ba9197d90"
        title="Platform Walkthrough"
      />

      <FormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        formUrl="https://forms.example.com/onboarding"
        title="Onboarding Forms"
      />

      <RoadmapModal
        isOpen={roadmapModalOpen}
        onClose={() => setRoadmapModalOpen(false)}
        title="Campaign Roadmap"
        steps={roadmapSteps}
      />

      <ServicesModal
        isOpen={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        title="Service Line Breakdown"
        services={servicesTabs}
      />

      <GuidesModal
        isOpen={guidesModalOpen}
        onClose={() => setGuidesModalOpen(false)}
        title={selectedGuide?.title}
        guide={selectedGuide}
      />

      <ChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        title="Onboarding Checklist"
        items={checklist}
        onItemToggle={handleChecklistItemToggle}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { CheckSquare } from 'lucide-react';

type RoadmapStep = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  date: string;
};

type EnhancedRoadmapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  steps: RoadmapStep[];
};

export default function EnhancedRoadmapModal({
  isOpen,
  onClose,
  title = 'Campaign Roadmap',
  steps
}: EnhancedRoadmapModalProps) {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="w-full max-w-4xl mx-auto">
        <p className="text-base text-[#4F515E] mb-8 text-center">
          Follow our proven campaign framework to maximize your results and achieve your goals.
        </p>
        
        {/* Visual Timeline */}
        <div className="relative pl-8 pr-4 mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="mb-8 relative">
              {/* Timeline connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-0 top-8 w-1 h-full bg-[#F0F0F7] -ml-4"></div>
              )}
              
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 -ml-8">
                {step.completed ? (
                  <div className="h-8 w-8 rounded-full bg-[#9EA8FB] flex items-center justify-center shadow-sm">
                    <CheckSquare size={18} className="text-white" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-[#D9D9D9] bg-white"></div>
                )}
              </div>
              
              {/* Content */}
              <div className={`p-5 rounded-lg ${step.completed ? 'bg-[#9EA8FB]/5 border border-[#9EA8FB]/20' : 'bg-white border border-[#F0F0F7]'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-[#12131C]">{step.title}</h3>
                  <span className="text-sm font-medium text-[#9EA8FB] bg-[#9EA8FB]/10 px-3 py-1 rounded-full ml-2 whitespace-nowrap">
                    {step.date}
                  </span>
                </div>
                <p className="text-base text-[#4F515E]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress Summary */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#4F515E]">
            <span className="font-medium">{steps.filter(step => step.completed).length}</span> of <span className="font-medium">{steps.length}</span> stages completed
          </p>
        </div>
      </div>
    </EnhancedModal>
  );
}

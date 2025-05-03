'use client';

import React from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { CheckCircle, Circle } from 'lucide-react';

type RoadmapStep = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  date: string;
};

type RoadmapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  steps: RoadmapStep[];
};

export default function RoadmapModal({
  isOpen,
  onClose,
  title = 'Campaign Roadmap',
  steps
}: RoadmapModalProps) {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="w-full">
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.id} className="mb-8 flex">
              <div className="flex flex-col items-center mr-4">
                <div>
                  {step.completed ? (
                    <CheckCircle size={24} className="text-[#9EA8FB]" />
                  ) : (
                    <Circle size={24} className="text-gray-300" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className="get-started-card pt-0 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[#12131C]">{step.title}</h3>
                  <span className="text-sm text-gray-500">{step.date}</span>
                </div>
                <p className="text-[#4F515E]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EnhancedModal>
  );
}

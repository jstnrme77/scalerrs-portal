'use client';

import React, { useState } from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { Check, Circle } from 'lucide-react';

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type ChecklistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items: ChecklistItem[];
  onItemToggle: (id: string, completed: boolean) => void;
};

export default function ChecklistModal({
  isOpen,
  onClose,
  title = 'Onboarding Checklist',
  items,
  onItemToggle
}: ChecklistModalProps) {
  // Calculate progress
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="w-full">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
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
              <span className="text-2xl font-bold text-[#12131C]">{completedCount}/{totalCount}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#4F515E]">{completedCount} of {totalCount} tasks completed</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-5 border rounded-[16px] ${
                item.completed
                  ? 'border-[#9EA8FB] bg-[#9EA8FB]/5'
                  : 'border-[#D9D9D9]'
              }`}
            >
              <div className="flex items-start">
                <button
                  onClick={() => onItemToggle(item.id, !item.completed)}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center mr-4 transition-all duration-200 ${
                    item.completed
                      ? 'bg-[#9EA8FB] border-[#9EA8FB] hover:bg-[#7D8AF2] hover:border-[#7D8AF2]'
                      : 'border-[#D9D9D9] hover:border-[#9EA8FB] hover:bg-[#9EA8FB]/10 hover:scale-110'
                  }`}
                  aria-label={item.completed ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as complete`}
                >
                  {item.completed && <Check size={14} className="text-white" />}
                </button>
                <div>
                  <h3 className={`font-medium text-base ${item.completed ? 'line-through text-[#4F515E]' : 'text-[#12131C]'}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4F515E] mt-2">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EnhancedModal>
  );
}

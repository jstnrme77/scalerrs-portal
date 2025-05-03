'use client';

import React from 'react';
import { EnhancedModal } from '@/components/ui/modals';

type FormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formUrl: string;
  title?: string;
};

export default function FormModal({
  isOpen,
  onClose,
  formUrl,
  title = 'Complete Form'
}: FormModalProps) {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="w-full h-[70vh]">
        {/* Check if we're in a development environment */}
        {formUrl.includes('example.com') ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
            <div className="mb-4 text-[#9EA8FB]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Demo Form</h3>
            <p className="text-[#4F515E] mb-4">This is a placeholder for the actual form that would be embedded here in production.</p>
            <div className="w-full max-w-md bg-white p-6 rounded-md border border-[#D9D9D9]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-left">Business Name</label>
                  <input type="text" className="w-full p-2 border border-[#D9D9D9] rounded-md" placeholder="Your business name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-left">Website URL</label>
                  <input type="text" className="w-full p-2 border border-[#D9D9D9] rounded-md" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-left">Business Goals</label>
                  <textarea className="w-full p-2 border border-[#D9D9D9] rounded-md h-24" placeholder="Describe your main business objectives"></textarea>
                </div>
                <button className="w-full bg-[#12131C] text-white py-2 rounded-md hover:opacity-90 transition-opacity">
                  Submit
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={formUrl}
            frameBorder="0"
            className="w-full h-full rounded-md"
            title={title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        )}
      </div>
    </EnhancedModal>
  );
}

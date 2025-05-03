'use client';

import React, { useState } from 'react';
import { EnhancedModal } from '@/components/ui/modals';

type ServiceTab = {
  id: string;
  title: string;
  description: string;
  features: string[];
  progress: number;
};

type ServicesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  services: ServiceTab[];
};

export default function ServicesModal({
  isOpen,
  onClose,
  title = 'Service Line Breakdown',
  services
}: ServicesModalProps) {
  const [activeTab, setActiveTab] = useState(services[0]?.id || '');

  const activeService = services.find(service => service.id === activeTab);

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="w-full">
        <div className="flex border-b border-[#D9D9D9] mb-4">
          {services.map((service) => (
            <button
              key={service.id}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === service.id
                  ? 'text-[#9EA8FB] border-b-2 border-[#9EA8FB]'
                  : 'text-[#4F515E]'
              }`}
              onClick={() => setActiveTab(service.id)}
            >
              {service.title}
            </button>
          ))}
        </div>

        {activeService && (
          <div>
            <h3 className="text-xl font-bold mb-2">{activeService.title}</h3>
            <p className="mb-4 text-[#4F515E]">{activeService.description}</p>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{activeService.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden get-started-progress">
                <div 
                  className="h-full bg-[#9EA8FB]" 
                  style={{ width: `${activeService.progress}%` }}
                ></div>
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Key Features:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {activeService.features.map((feature, index) => (
                <li key={index} className="text-[#4F515E]">{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}

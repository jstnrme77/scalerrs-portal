'use client';

import React from 'react';
import { Document } from '@/components/ui/cards';
import { Card } from '@/components/ui/cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';

type AdminAgreementProps = {
  agreements: (Document & { uploadedBy: string; editable: boolean })[];
  settings: {
    renewalDate?: string;
    planName?: string;
    showUpgradePrompt?: boolean;
    [key: string]: any;
  };
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
};

export default function AdminAgreement({ 
  agreements,
  settings,
  onView,
  onDownload
}: AdminAgreementProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-dark">Agreement</h2>
        <p className="text-sm text-mediumGray">Legal and onboarding documentation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {agreements.map(agreement => (
          <div key={agreement.id} className="bg-white border border-gray-200 rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="mr-3"><FileText className="h-7 w-7 text-red-500" /></span>
                  <div>
                    <h4 className="text-base font-medium text-dark">{agreement.name}</h4>
                  </div>
                </div>
                <Badge 
                  className={`text-xs !rounded-lg ${
                    agreement.uploadedBy === 'Scalerrs' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {agreement.uploadedBy}
                </Badge>
              </div>
              <div className="flex space-x-2">
                {onView && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onView(agreement.id)}
                    className="text-xs py-1 px-2.5 rounded-[8px] font-medium"
                  >
                    View
                  </Button>
                )}
                {onDownload && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onDownload(agreement.id)}
                    className="text-xs py-1 px-2.5 rounded-[8px] font-medium text-white"
                  >
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

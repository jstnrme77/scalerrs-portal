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
      
      {(settings.renewalDate || settings.planName || settings.showUpgradePrompt) && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-dark mb-3">Plan Information</h3>
          <Card className="bg-white border border-gray-300 shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {settings.planName && (
                <div>
                  <p className="text-sm font-medium text-mediumGray">Current Plan</p>
                  <p className="text-md font-semibold text-dark">{settings.planName}</p>
                </div>
              )}
              
              {settings.renewalDate && (
                <div>
                  <p className="text-sm font-medium text-mediumGray">Renewal Date</p>
                  <p className="text-md font-semibold text-dark">
                    {new Date(settings.renewalDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {settings.showUpgradePrompt && (
                <div className="flex items-center">
                  <Button 
                    variant="default"
                    className="font-bold rounded-[16px] text-sm"
                  >
                    Upgrade Plan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
          <p className="text-xs text-mediumGray mt-2">
            <span className="font-medium">Note:</span> Plan information is managed by the Scalerrs team. Please contact your account manager for any changes.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { DocumentCard, Document } from '@/components/ui/cards';
import { Card } from '@/components/ui/cards';
import { Badge } from '@/components/ui/badges';

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
          <DocumentCard 
            key={agreement.id} 
            document={agreement} 
            onView={onView}
            onDownload={onDownload}
          >
            <div className="flex justify-between items-center mt-2">
              <Badge variant="light" className="text-xs">
                View only
              </Badge>
              <Badge variant="light" className="text-xs bg-gray-100 text-gray-600">
                Uploaded by {agreement.uploadedBy}
              </Badge>
            </div>
          </DocumentCard>
        ))}
      </div>
      
      {(settings.renewalDate || settings.planName || settings.showUpgradePrompt) && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-dark mb-3">Plan Information</h3>
          <Card className="bg-gray-50">
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
                  <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors">
                    Upgrade Plan
                  </button>
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

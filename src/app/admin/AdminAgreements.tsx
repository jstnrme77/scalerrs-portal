'use client';

import React from 'react';
import { DocumentCard, Document } from '@/components/ui/cards';
import { Button } from '@/components/ui/forms';

type AdminAgreementsProps = {
  agreements: Document[];
  onUpload?: () => void;
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
};

export default function AdminAgreements({ 
  agreements,
  onUpload,
  onView,
  onDownload
}: AdminAgreementsProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-dark">Service Agreements</h2>
        <Button 
          variant="primary"
          onClick={onUpload}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Agreement
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agreements.map(agreement => (
          <DocumentCard 
            key={agreement.id} 
            document={agreement} 
            onView={onView}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { FilloutStandardEmbed } from "@fillout/react";
import { ExternalLink } from 'lucide-react';

type FormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filloutId: string;
  clientId?: string | null;
  title?: string;
};

export default function FormModal({
  isOpen,
  onClose,
  filloutId,
  clientId,
  title = 'Complete Form'
}: FormModalProps) {
  if (!isOpen) return null;

  const directFilloutUrl = `https://forms.fillout.com/t/${filloutId}${clientId ? `?record_id=${clientId}` : ''}`;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="flex flex-col w-full h-[calc(80vh-100px)] md:h-[calc(85vh-100px)]" style={{minHeight: '500px'}}>
        {isOpen && filloutId ? (
          <div className="flex-grow w-full h-full">
            <FilloutStandardEmbed
              filloutId={filloutId}
              parameters={clientId ? { record_id: clientId } : {}}
            />
          </div>
        ) : (
          <p className="text-center p-8">Form cannot be loaded. Configuration missing.</p>
        )}
        <div className="pt-4 text-center">
          <a 
            href={directFilloutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Open form in a new window <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </EnhancedModal>
  );
}
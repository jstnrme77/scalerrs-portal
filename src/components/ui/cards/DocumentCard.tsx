'use client';

import React, { ReactNode } from 'react';
import Card from './Card';

export type Document = {
  id: number;
  name: string;
  type: string;
  lastUpdated: string;
  size: string;
  category?: string;
  uploadedBy?: string;
};

type DocumentCardProps = {
  document: Document;
  className?: string;
  children?: ReactNode;
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
};

/**
 * A card component for displaying document information
 */
export default function DocumentCard({
  document,
  className = '',
  children,
  onView,
  onDownload
}: DocumentCardProps) {
  return (
    <Card className={`${className} shadow-none border border-gray-300`}>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-md font-medium text-text-light dark:text-text-dark mt-2">{document.name}</h3>
      </div>

      <div className="w-full h-px bg-gray-300 mb-5"></div>

      {children && (
        <>
          <div className="mb-5">{children}</div>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
        </>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => onView && onView(document.id)}
          className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-[16px] hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        >
          <span>View</span>
        </button>
        <button
          onClick={() => onDownload && onDownload(document.id)}
          className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-[16px] hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
        >
          <span>Download</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" stroke="white" />
            <path d="m12 5 7 7-7 7" stroke="white" />
          </svg>
        </button>
      </div>
    </Card>
  );
}

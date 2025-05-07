'use client';

import React, { ReactNode } from 'react';
import Card from './Card';
import FileTypeBadge from '../badges/FileTypeBadge';

export type Document = {
  id: number;
  name: string;
  type: string;
  lastUpdated: string;
  size: string;
  category?: string;
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
    <Card className={className}>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-md font-medium text-text-light dark:text-text-dark mt-2">{document.name}</h3>
        <FileTypeBadge type={document.type} />
      </div>

      <div className="w-full h-px bg-gray-300 mb-5"></div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="text-sm text-mediumGray dark:text-gray-300 mb-2">
          <span className="font-medium">Updated:</span> {new Date(document.lastUpdated).toLocaleDateString()}
        </div>

        <div className="text-sm text-mediumGray dark:text-gray-300 mb-2">
          <span className="font-medium">Size:</span> {document.size}
        </div>

        {'category' in document && document.category && (
          <div className="text-sm text-mediumGray dark:text-gray-300">
            <span className="font-medium">Category:</span> {document.category}
          </div>
        )}
      </div>

      {children && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="mb-5">{children}</div>
        </>
      )}

      <div className="w-full h-px bg-gray-300 mb-5"></div>
      <div className="flex space-x-3">
        <button
          onClick={() => onView && onView(document.id)}
          className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => onDownload && onDownload(document.id)}
          className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
        >
          Download
        </button>
      </div>
    </Card>
  );
}

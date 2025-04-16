'use client';

import React from 'react';
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
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
};

/**
 * A card component for displaying document information
 */
export default function DocumentCard({ 
  document, 
  className = '',
  onView,
  onDownload
}: DocumentCardProps) {
  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-dark">{document.name}</h3>
        <FileTypeBadge type={document.type} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Updated:</span> {new Date(document.lastUpdated).toLocaleDateString()}
        </div>
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Size:</span> {document.size}
        </div>
        
        {'category' in document && document.category && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Category:</span> {document.category}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
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

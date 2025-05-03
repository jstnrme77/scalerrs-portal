'use client';

import { useEffect, useState, useRef } from 'react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  title?: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentUrl,
  title = 'Document Viewer'
}: DocumentViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset loading state when document URL changes
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }
  }, [documentUrl, isOpen]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Check if the URL is a Google Doc or Google Drive URL
  const isGoogleDoc = documentUrl.includes('docs.google.com') || documentUrl.includes('drive.google.com');

  // Modify URL for embedding if it's a Google Doc
  const getEmbedUrl = () => {
    if (isGoogleDoc) {
      // If it's a Google Doc, convert to embedded view
      if (documentUrl.includes('/edit')) {
        return documentUrl.replace('/edit', '/preview');
      } else if (documentUrl.includes('/view')) {
        return documentUrl.replace('/view', '/preview');
      } else {
        return documentUrl + '/preview';
      }
    }
    return documentUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Invisible overlay to capture clicks outside the modal */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal container */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          <iframe
            src={getEmbedUrl()}
            className="w-full h-[calc(90vh-8rem)]"
            onLoad={handleIframeLoad}
            title="Document Viewer"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Open in new tab
          </a>
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

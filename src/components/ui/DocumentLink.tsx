'use client';

import { isValidUrl, ensureUrlProtocol } from '@/utils/field-utils';

interface DocumentLinkProps {
  url?: string;
  title: string;
  label?: string;
  onViewDocument?: (url: string, title: string) => void;
  className?: string;
}

/**
 * Reusable component for document links
 * Handles both direct links and modal viewing
 */
export default function DocumentLink({ url, title, label, onViewDocument, className = '' }: DocumentLinkProps) {
  if (!url || !isValidUrl(url)) {
    return null;
  }

  // Default label if not provided
  const displayLabel = label || 'View Document';

  // Base classes for the link
  const baseClasses = 'inline-flex items-center text-xs text-primary hover:underline ' + className;

  // Eye icon SVG
  const eyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  // Ensure URL has a protocol
  const processedUrl = ensureUrlProtocol(url);

  // If onViewDocument is provided, use a button that calls it
  if (onViewDocument) {
    return (
      <button
        onClick={() => onViewDocument(processedUrl, title)}
        className={baseClasses}
      >
        {eyeIcon}
        {displayLabel}
      </button>
    );
  }

  // Otherwise, use a direct link
  return (
    <a
      href={processedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClasses}
    >
      {eyeIcon}
      {displayLabel}
    </a>
  );
}

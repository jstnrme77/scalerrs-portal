'use client';

import React from 'react';
import Badge from './Badge';

type FileTypeBadgeProps = {
  type: string;
  className?: string;
};

/**
 * A badge component for displaying file types
 */
export default function FileTypeBadge({ type, className = '' }: FileTypeBadgeProps) {
  let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'light' = 'secondary';
  let bgColor;
  let textColor;

  switch (type) {
    case 'PDF':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'DOCX':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'XLSX':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'MP4':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'ZIP':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      break;
    case 'PPTX':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    default:
      variant = 'secondary';
  }

  return (
    <Badge
      variant={variant}
      bgColor={bgColor}
      textColor={textColor}
      className={className}
    >
      {type}
    </Badge>
  );
}

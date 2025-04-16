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
  let bgColor = '';
  let textColor = '';
  
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
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }
  
  return (
    <Badge 
      label={type} 
      bgColor={bgColor} 
      textColor={textColor} 
      className={className}
    />
  );
}

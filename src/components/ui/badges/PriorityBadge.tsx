'use client';

import React from 'react';
import Badge from './Badge';

export type TaskPriority = 'High' | 'Medium' | 'Low';

type PriorityBadgeProps = {
  priority?: TaskPriority;
  originalPriority?: string;
  className?: string;
};

/**
 * A badge component for displaying task priority
 */
export default function PriorityBadge({ priority, originalPriority, className = '' }: PriorityBadgeProps) {
  // If no priority data is available, show a dash
  if (!priority && !originalPriority) {
    return <span className="px-3 py-1 text-xs font-medium rounded-full inline-flex items-center justify-center bg-lightGray text-mediumGray">-</span>;
  }
  
  let bgColor = '';
  let textColor = '';
  let displayText = priority || '-';

  // First check if we have original Airtable value to display
  if (originalPriority) {
    // Use the original value if available
    displayText = originalPriority;
    
    // Apply styling based on priority level
    if (originalPriority.toLowerCase().includes('high')) {
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    } else if (originalPriority.toLowerCase().includes('low')) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (originalPriority.toLowerCase().includes('medium') || originalPriority.toLowerCase().includes('mid')) {
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
    } else {
      // Default styling
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
    }
  } else {
    // Use the mapped priority value
    switch (priority) {
      case 'High':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'Medium':
        bgColor = 'bg-gold/10';
        textColor = 'text-gold';
        break;
      case 'Low':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      default:
        bgColor = 'bg-lightGray';
        textColor = 'text-mediumGray';
    }
  }

  return (
    <Badge
      bgColor={bgColor}
      textColor={textColor}
      className={className}
    >
      {displayText}
    </Badge>
  );
}

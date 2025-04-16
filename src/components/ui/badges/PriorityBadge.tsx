'use client';

import React from 'react';
import Badge from './Badge';

export type TaskPriority = 'High' | 'Medium' | 'Low';

type PriorityBadgeProps = {
  priority: TaskPriority;
  className?: string;
};

/**
 * A badge component for displaying task priority
 */
export default function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  let bgColor = '';
  let textColor = '';
  
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
  
  return (
    <Badge 
      label={priority} 
      bgColor={bgColor} 
      textColor={textColor} 
      className={className}
    />
  );
}

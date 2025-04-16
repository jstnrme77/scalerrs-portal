'use client';

import React from 'react';
import Badge from './Badge';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Done';

type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

/**
 * A badge component for displaying task status
 */
export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Not Started':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'In Progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Blocked':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'Done':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }

  return (
    <Badge
      bgColor={bgColor}
      textColor={textColor}
      className={className}
    >
      {status}
    </Badge>
  );
}

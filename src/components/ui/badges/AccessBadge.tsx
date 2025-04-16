'use client';

import React from 'react';
import Badge from './Badge';

export type AccessLevel = 'Admin' | 'Editor' | 'Viewer';

type AccessBadgeProps = {
  access: AccessLevel | string;
  className?: string;
};

/**
 * A badge component for displaying user access levels
 */
export default function AccessBadge({ access, className = '' }: AccessBadgeProps) {
  let bgColor = '';
  let textColor = '';
  
  switch (access) {
    case 'Admin':
      bgColor = 'bg-primary/10';
      textColor = 'text-primary';
      break;
    case 'Editor':
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
      break;
    case 'Viewer':
      bgColor = 'bg-lavender/10';
      textColor = 'text-lavender';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }
  
  return (
    <Badge 
      label={access} 
      bgColor={bgColor} 
      textColor={textColor} 
      className={className}
    />
  );
}

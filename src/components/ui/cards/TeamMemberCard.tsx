'use client';

import React from 'react';
import Card from './Card';
import AccessBadge from '../badges/AccessBadge';
import { AccessLevel } from '../badges/AccessBadge';

export type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  type: string;
  phone: string;
  access: AccessLevel | string;
};

type TeamMemberCardProps = {
  member: TeamMember;
  className?: string;
  onEdit?: (id: number) => void;
};

/**
 * A card component for displaying team member information
 */
export default function TeamMemberCard({
  member,
  className = '',
  onEdit
}: TeamMemberCardProps) {
  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-text-light dark:text-text-dark">{member.name}</h3>
        <AccessBadge access={member.access} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-mediumGray dark:text-gray-300">
          <span className="font-medium">Role:</span> {member.role}
        </div>

        <div className="text-sm text-mediumGray dark:text-gray-300">
          <span className="font-medium">Email:</span> {member.email}
        </div>

        <div className="text-sm text-mediumGray dark:text-gray-300">
          <span className="font-medium">Phone:</span> {member.phone}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit && onEdit(member.id)}
          className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
        >
          Edit Access
        </button>
      </div>
    </Card>
  );
}

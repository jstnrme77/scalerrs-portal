'use client';

import React from 'react';
import { TeamMemberCard, TeamMember } from '@/components/ui/cards';
import { Button } from '@/components/ui/forms';

type AdminTeamProps = {
  team: TeamMember[];
  onAddMember: () => void;
  onEditAccess: (id: number) => void;
};

export default function AdminTeam({ 
  team,
  onAddMember,
  onEditAccess
}: AdminTeamProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-dark">Team Members</h2>
        <Button 
          variant="primary"
          onClick={onAddMember}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Team Member
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <TeamMemberCard 
            key={member.id} 
            member={member} 
            onEdit={onEditAccess} 
          />
        ))}
      </div>
    </div>
  );
}

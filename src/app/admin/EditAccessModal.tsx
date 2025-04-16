'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modals';
import { Button } from '@/components/ui/forms';
import { TeamMember } from '@/components/ui/cards';

type EditAccessModalProps = {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (id: number, access: string) => void;
};

export default function EditAccessModal({
  isOpen,
  member,
  onClose,
  onSave
}: EditAccessModalProps) {
  const [selectedAccess, setSelectedAccess] = useState('');
  
  if (!isOpen || !member) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Access for ${member.name}`}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-mediumGray mb-1">Access Level</label>
        <select 
          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedAccess || member.access}
          onChange={(e) => setSelectedAccess(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-mediumGray mb-2">Access Level Permissions:</div>
        <div className="space-y-2">
          <div className="bg-primary/10 p-2 rounded-scalerrs">
            <div className="text-sm font-medium text-primary">Admin</div>
            <div className="text-xs text-mediumGray">Full access to all features, can manage users and settings</div>
          </div>
          
          <div className="bg-gold/10 p-2 rounded-scalerrs">
            <div className="text-sm font-medium text-gold">Editor</div>
            <div className="text-xs text-mediumGray">Can view and edit content, but cannot manage users or settings</div>
          </div>
          
          <div className="bg-lavender/10 p-2 rounded-scalerrs">
            <div className="text-sm font-medium text-lavender">Viewer</div>
            <div className="text-xs text-mediumGray">Can only view content, no editing capabilities</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          variant="primary"
          onClick={() => {
            onSave(member.id, selectedAccess || member.access);
            onClose();
          }}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

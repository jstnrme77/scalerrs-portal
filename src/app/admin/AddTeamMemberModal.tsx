'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modals';
import { Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/forms';
import { TeamMember } from '@/components/ui/cards';

type AddTeamMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Omit<TeamMember, 'id'> & { id?: number }) => void;
};

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onAdd
}: AddTeamMemberModalProps) {
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    role: '',
    access: 'Viewer',
    phone: '',
    type: 'Client'
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberData.name.trim() && memberData.email.trim() && memberData.role.trim()) {
      onAdd({
        ...memberData,
        id: Date.now()
      });
      setMemberData({
        name: '',
        email: '',
        role: '',
        access: 'Viewer',
        phone: '',
        type: 'Client'
      });
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Name"
            type="text"
            placeholder="Enter name"
            value={memberData.name}
            onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
            required
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={memberData.email}
            onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
            required
          />
          
          <Input
            label="Role"
            type="text"
            placeholder="Enter role"
            value={memberData.role}
            onChange={(e) => setMemberData({ ...memberData, role: e.target.value })}
            required
          />
          
          <Input
            label="Phone"
            type="text"
            placeholder="Enter phone number"
            value={memberData.phone}
            onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-mediumGray mb-1">Access Level</label>
            <select 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={memberData.access}
              onChange={(e) => setMemberData({ ...memberData, access: e.target.value })}
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-mediumGray mb-1">Type</label>
            <select 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={memberData.type}
              onChange={(e) => setMemberData({ ...memberData, type: e.target.value })}
            >
              <option value="Client">Client</option>
              <option value="Agency">Agency</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="primary"
          >
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}

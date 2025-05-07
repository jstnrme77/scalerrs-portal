'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  
  if (!member) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Edit Access for ${member.name}`}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-mediumGray">Access Level</label>
            <Select
              value={selectedAccess || member.access}
              onValueChange={setSelectedAccess}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-mediumGray mb-2">Access Level Permissions:</div>
            <div className="space-y-2">
              <div className="bg-purple-100 p-2 rounded-[8px]">
                <div className="text-sm font-medium text-purple-800">Admin</div>
                <div className="text-xs text-mediumGray">Full access to all features, can manage users and settings</div>
              </div>
              
              <div className="bg-gold/10 p-2 rounded-[8px]">
                <div className="text-sm font-medium text-gold">Editor</div>
                <div className="text-xs text-mediumGray">Can view and edit content, but cannot manage users or settings</div>
              </div>
              
              <div className="bg-lavender/10 p-2 rounded-[8px]">
                <div className="text-sm font-medium text-lavender">Viewer</div>
                <div className="text-xs text-mediumGray">Can only view content, no editing capabilities</div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={onClose}
              className="font-bold rounded-[16px]"
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                onSave(member.id, selectedAccess || member.access);
                onClose();
              }}
              className="font-bold rounded-[16px]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

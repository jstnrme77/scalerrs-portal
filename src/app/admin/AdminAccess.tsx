'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Plus } from 'lucide-react';

type AccessItem = {
  id: number;
  service: string;
  username: string;
  password: string;
  notes: string;
  lastUpdated: string;
  uploadedBy: string;
  editable: boolean;
};

type AdminAccessProps = {
  accessItems: AccessItem[];
  onAddAccess: (newAccess: Omit<AccessItem, 'id' | 'password' | 'lastUpdated' | 'uploadedBy' | 'editable'>) => void;
  onChangePassword: (id: number) => void;
  onCopyLogin?: (id: number) => void;
  onGoToService?: (id: number) => void;
};

export default function AdminAccess({
  accessItems,
  onAddAccess,
  onChangePassword,
  onCopyLogin,
  onGoToService
}: AdminAccessProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccess, setNewAccess] = useState({
    service: '',
    username: '',
    notes: ''
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  const handleAddAccess = () => {
    onAddAccess(newAccess);
    setNewAccess({ service: '', username: '', notes: '' });
    setIsAddModalOpen(false);
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium text-dark">Access & Logins</h2>
          <p className="text-sm text-mediumGray">Central place for tool credentials and access management</p>
        </div>
        <Button
          variant="default"
          onClick={() => setIsAddModalOpen(true)}
          className="font-bold rounded-[16px] px-5 py-2 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Access
        </Button>
      </div>

      <div className="overflow-x-auto mb-4 bg-white rounded-[12px]" style={{ color: '#353233' }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-b border-gray-200">
              <TableHead className="rounded-tl-[12px]">TOOL</TableHead>
              <TableHead>USERNAME</TableHead>
              <TableHead>PASSWORD</TableHead>
              <TableHead>NOTES</TableHead>
              <TableHead>LAST UPDATED</TableHead>
              <TableHead className="text-right rounded-tr-[12px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accessItems.map(access => (
              <TableRow key={access.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center">
                    <div className="text-base font-medium text-dark">{access.service}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-base text-mediumGray">{access.username}</div>
                </TableCell>
                <TableCell>
                  <div className="text-base text-mediumGray flex items-center space-x-2">
                    <span>{visiblePasswords[access.id] ? "password123" : access.password}</span>
                    <button 
                      type="button"
                      onClick={() => togglePasswordVisibility(access.id)}
                      className="ml-2 text-primary hover:text-primary/80 focus:outline-none"
                      aria-label={visiblePasswords[access.id] ? "Hide password" : "Show password"}
                    >
                      {visiblePasswords[access.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-base text-mediumGray">{access.notes || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="text-base text-mediumGray">{new Date(access.lastUpdated).toLocaleDateString()}</div>
                    <Badge 
                      className={`ml-2 text-xs !rounded-lg ${
                        access.uploadedBy === 'Scalerrs' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {access.uploadedBy}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onChangePassword(access.id)}
                      className="font-medium rounded-[8px]"
                    >
                      Edit Details
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Access Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="service" className="block text-sm font-medium text-mediumGray">Tool/Service Name</label>
              <Input
                id="service"
                value={newAccess.service}
                onChange={(e) => setNewAccess({...newAccess, service: e.target.value})}
                placeholder="e.g., WordPress, Google Analytics"
                className="w-full rounded-[8px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-mediumGray">Username/Email</label>
              <Input
                id="username"
                value={newAccess.username}
                onChange={(e) => setNewAccess({...newAccess, username: e.target.value})}
                placeholder="Username or email address"
                className="w-full rounded-[8px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-mediumGray">Notes (Optional)</label>
              <Textarea
                id="notes"
                value={newAccess.notes}
                onChange={(e) => setNewAccess({...newAccess, notes: e.target.value})}
                placeholder="Add any additional information"
                className="w-full rounded-[8px]"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="font-bold rounded-[16px]"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAddAccess}
              disabled={!newAccess.service || !newAccess.username}
              className="font-bold rounded-[16px]"
            >
              Add Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

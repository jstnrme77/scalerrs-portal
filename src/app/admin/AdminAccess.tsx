'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/cards';
import { Button, Input, TextArea } from '@/components/ui/forms';
import { Badge } from '@/components/ui/badges';
import { Modal } from '@/components/ui/modals';

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

  const handleAddAccess = () => {
    onAddAccess(newAccess);
    setNewAccess({ service: '', username: '', notes: '' });
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium text-dark">Access & Logins</h2>
          <p className="text-sm text-mediumGray">Central place for tool credentials and access management</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Access
        </Button>
      </div>

      <div className="card overflow-x-auto mb-4 bg-white" style={{ color: '#353233' }}>
        <table className="min-w-full divide-y divide-lightGray">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Tool</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Username</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Password</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Notes</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Last Updated</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-mediumGray uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-lightGray">
            {accessItems.map(access => (
              <tr key={access.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-dark">{access.service}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-mediumGray">{access.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-mediumGray">{access.password}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-mediumGray">{access.notes || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-mediumGray">{new Date(access.lastUpdated).toLocaleDateString()}</div>
                    <Badge variant="light" className="ml-2 text-xs bg-gray-100 text-gray-600">
                      {access.uploadedBy}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => onChangePassword(access.id)}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => onCopyLogin && onCopyLogin(access.id)}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => onGoToService && onGoToService(access.id)}
                      className="flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Go to Service
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Access Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Access"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-mediumGray mb-1">Tool/Service Name</label>
            <Input
              id="service"
              value={newAccess.service}
              onChange={(e) => setNewAccess({...newAccess, service: e.target.value})}
              placeholder="e.g., WordPress, Google Analytics"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-mediumGray mb-1">Username/Email</label>
            <Input
              id="username"
              value={newAccess.username}
              onChange={(e) => setNewAccess({...newAccess, username: e.target.value})}
              placeholder="Username or email address"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-mediumGray mb-1">Notes (Optional)</label>
            <TextArea
              id="notes"
              value={newAccess.notes}
              onChange={(e) => setNewAccess({...newAccess, notes: e.target.value})}
              placeholder="Add any additional information"
              className="w-full"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddAccess}
              disabled={!newAccess.service || !newAccess.username}
            >
              Add Access
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

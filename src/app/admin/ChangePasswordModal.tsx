'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modals';
import { Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/forms';

type AccessItem = {
  id: number;
  service: string;
  username: string;
  password: string;
};

type ChangePasswordModalProps = {
  isOpen: boolean;
  accessItem: AccessItem | null;
  onClose: () => void;
  onSave: (id: number, newPassword: string) => void;
};

export default function ChangePasswordModal({
  isOpen,
  accessItem,
  onClose,
  onSave
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Save the new password
    onSave(accessItem?.id || 0, newPassword);
    
    // Reset form
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };
  
  if (!isOpen || !accessItem) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Password for ${accessItem.service}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Username"
            value={accessItem.username}
            disabled
            className="bg-gray-50"
          />
          
          <div>
            <label className="block text-sm font-medium text-mediumGray mb-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full border border-lightGray rounded-scalerrs p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-mediumGray"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
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
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

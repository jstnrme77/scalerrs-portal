'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

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
  onSave: (id: number, newPassword: string, newUsername: string) => void;
};

export default function ChangePasswordModal({
  isOpen,
  accessItem,
  onClose,
  onSave
}: ChangePasswordModalProps) {
  const [username, setUsername] = useState(accessItem?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (accessItem) {
      setUsername(accessItem.username);
    }
  }, [accessItem]);
  
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
    
    // Save the new details
    onSave(accessItem?.id || 0, newPassword, username);
    
    // Reset form
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };
  
  if (!accessItem) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Change Password for ${accessItem.service}`}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-mediumGray">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-mediumGray">New Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-mediumGray mt-1">
              {showPassword ? "Password visible" : "Password hidden"} - click the eye icon to {showPassword ? "hide" : "show"}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-mediumGray">Confirm Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-[8px]">{error}</div>
          )}
        
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              className="font-bold rounded-[16px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default"
              className="font-bold rounded-[16px]"
            >
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
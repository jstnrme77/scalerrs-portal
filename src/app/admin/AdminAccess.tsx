'use client';

import React from 'react';
import { Card } from '@/components/ui/cards';
import { Button } from '@/components/ui/forms';

type AccessItem = {
  id: number;
  service: string;
  username: string;
  password: string;
};

type AdminAccessProps = {
  accessItems: AccessItem[];
  onAddAccess?: () => void;
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
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-dark">Access & Passwords</h2>
        <Button 
          variant="primary"
          onClick={onAddAccess}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Access
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessItems.map(access => (
          <Card key={access.id}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-md font-medium text-dark">{access.service}</h3>
              <Button 
                variant="text"
                onClick={() => onChangePassword(access.id)}
              >
                Change Password
              </Button>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-mediumGray">
                <span className="font-medium">Username:</span> {access.username}
              </div>
              
              <div className="text-sm text-mediumGray">
                <span className="font-medium">Password:</span> {access.password}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                variant="text"
                onClick={() => onCopyLogin && onCopyLogin(access.id)}
              >
                Copy Login Info
              </Button>
              <Button 
                variant="text"
                onClick={() => onGoToService && onGoToService(access.id)}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to Service
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

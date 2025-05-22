'use client';

import React from 'react';
import { User } from '@/types';
import UserClientDisplay from './ui/UserClientDisplay';
import { useUserClientNames } from './ui/UserClientDisplay';

interface UserClientInfoProps {
  user: User;
  showDetails?: boolean;
  className?: string;
}

/**
 * Component to display client information for a user
 */
export default function UserClientInfo({ 
  user, 
  showDetails = false,
  className = '' 
}: UserClientInfoProps) {
  // Use the hook to get client names
  const { clientNames, isLoading } = useUserClientNames(user.Clients);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center">
        <span className="font-medium mr-2">User:</span>
        <span>{user.Name}</span>
      </div>
      
      <div className="flex items-center">
        <span className="font-medium mr-2">Role:</span>
        <span>{user.Role}</span>
      </div>
      
      <div>
        <span className="font-medium mr-2">Client{clientNames.length > 1 ? 's' : ''}:</span>
        {isLoading ? (
          <span className="text-gray-500">Loading...</span>
        ) : (
          <div className="mt-1">
            {clientNames.length > 0 ? (
              <ul className="list-disc pl-5">
                {clientNames.map((name, index) => (
                  <li key={index} className="text-sm">
                    {name}
                    {showDetails && user.Clients && Array.isArray(user.Clients) && (
                      <span className="text-xs text-gray-500 ml-2">
                        (ID: {Array.isArray(user.Clients) ? user.Clients[index] : user.Clients})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">No clients assigned</span>
            )}
          </div>
        )}
      </div>
      
      {/* Simple usage example of the UserClientDisplay component */}
      <div className="mt-4 pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Alternative display:</p>
        <UserClientDisplay clientIds={user.Clients} />
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { getUserClientNames, getUserClientNamesSync } from '@/utils/clientUtils';

interface UserClientDisplayProps {
  clientIds: string | string[] | undefined;
  showLabel?: boolean;
  className?: string;
}

/**
 * Component to display client names for a user's Clients array
 */
export default function UserClientDisplay({ 
  clientIds, 
  showLabel = true, 
  className = '' 
}: UserClientDisplayProps) {
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Try to get client names from cache first for immediate display
  useEffect(() => {
    // Get client names synchronously from cache
    const cachedNames = getUserClientNamesSync(clientIds);
    setClientNames(cachedNames);
    
    // Then fetch the actual names asynchronously
    const fetchNames = async () => {
      try {
        const names = await getUserClientNames(clientIds);
        setClientNames(names);
      } catch (error) {
        console.error('Error fetching client names:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNames();
  }, [clientIds]);

  if (!clientIds || (Array.isArray(clientIds) && clientIds.length === 0)) {
    return (
      <span className={className}>
        {showLabel && <span className="font-medium">Client: </span>}
        <span className="text-gray-500">Unassigned</span>
      </span>
    );
  }

  return (
    <div className={className}>
      {showLabel && <span className="font-medium">Client{clientNames.length > 1 ? 's' : ''}: </span>}
      {isLoading ? (
        <span className="text-gray-500">Loading...</span>
      ) : (
        <span>{clientNames.join(', ')}</span>
      )}
    </div>
  );
}

/**
 * Hook to get client names for a user's Clients array
 */
export function useUserClientNames(clientIds: string | string[] | undefined) {
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get client names synchronously from cache
    const cachedNames = getUserClientNamesSync(clientIds);
    setClientNames(cachedNames);
    
    // Then fetch the actual names asynchronously
    const fetchNames = async () => {
      try {
        const names = await getUserClientNames(clientIds);
        setClientNames(names);
      } catch (error) {
        console.error('Error fetching client names:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNames();
  }, [clientIds]);

  return { clientNames, isLoading };
} 
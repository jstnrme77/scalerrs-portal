'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ClientDataContextType {
  clientId: string | null;
  setClientId: (id: string | null) => void;
  availableClients: { id: string; name: string }[];
  isLoading: boolean;
  filterDataByClient: <T extends { Client?: string | string[] }>(data: T[]) => T[];
}

const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

export function ClientDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize available clients based on user data
  useEffect(() => {
    if (user) {
      setIsLoading(true);

      // If user has Client field and is a Client role
      if (user.Client && user.Role === 'Client') {
        // Ensure Client is an array
        const clientIds = Array.isArray(user.Client) ? user.Client : [user.Client];

        // Convert client IDs to client objects
        // In a real app, you'd fetch client names from Airtable
        const clients = clientIds.map(id => ({
          id,
          name: `Client ${id.substring(0, 5)}` // Use part of ID as name for demo
        }));

        setAvailableClients(clients);

        // Set default client ID to first client
        if (clients.length > 0 && !clientId) {
          setClientId(clients[0].id);
        }
      } else if (user.Role === 'Admin') {
        // For admin users, we could fetch all clients from Airtable
        // For now, just use a placeholder
        setAvailableClients([
          { id: 'all', name: 'All Clients' }
        ]);
        setClientId('all');
      }

      setIsLoading(false);
    }
  }, [user, clientId]);

  // Function to filter data by client
  const filterDataByClient = <T extends { Client?: string | string[] }>(data: T[]): T[] => {
    // If no client ID selected or user is admin with 'all' selected, return all data
    if (!clientId || (user?.Role === 'Admin' && clientId === 'all')) {
      return data;
    }

    // Filter data by client ID
    return data.filter(item => {
      if (!item.Client) return false;

      if (Array.isArray(item.Client)) {
        return item.Client.includes(clientId);
      } else {
        return item.Client === clientId;
      }
    });
  };

  return (
    <ClientDataContext.Provider
      value={{
        clientId,
        setClientId,
        availableClients,
        isLoading,
        filterDataByClient
      }}
    >
      {children}
    </ClientDataContext.Provider>
  );
}

export function useClientData() {
  const context = useContext(ClientDataContext);
  if (context === undefined) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  return context;
}

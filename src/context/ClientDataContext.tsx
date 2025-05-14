'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getClientName } from '@/utils/clientUtils';

interface ClientDataContextType {
  clientId: string | null;
  setClientId: (id: string | null) => void;
  availableClients: { id: string; name: string }[];
  isLoading: boolean;
  filterDataByClient: <T extends {
    Client?: string | string[];
    'All Clients'?: string | string[];
    AssignedTo?: string | string[];
    Writer?: string | string[];
    Editor?: string | string[];
    SEOStrategist?: string | string[];
    ContentWriter?: string | string[];
    ContentEditor?: string | string[]
  }>(data: T[]) => T[];
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

      const fetchClientData = async () => {
        // Initialize the client cache for the getClientName utility
        try {
          await getClientName('init-cache');
          console.log('Client cache initialized');
        } catch (error) {
          console.error('Error initializing client cache:', error);
        }
        try {
          // If user has Client field and is a Client role
          if (user.Client && user.Role === 'Client') {
            // Ensure Client is an array
            const clientIds = Array.isArray(user.Client) ? user.Client : [user.Client];

            // Fetch all clients to get their names
            const { fetchClients } = await import('@/lib/client-api');
            const allClients = await fetchClients();

            // Filter clients to only include those assigned to this user
            const userClients = allClients
              .filter(client => clientIds.includes(client.id))
              .map(client => ({
                id: client.id,
                name: client.Name || `Client ${client.id.substring(0, 5)}`
              }));

            setAvailableClients(userClients);

            // Set default client ID to first client only if clientId is not set
            if (userClients.length > 0 && !clientId) {
              setClientId(userClients[0].id);
            }
          } else if (user.Role === 'Admin') {
            // For admin users, fetch all clients from Airtable
            const { fetchClients } = await import('@/lib/client-api');
            const allClients = await fetchClients();

            // Create client objects with id and name
            const clientOptions = allClients.map(client => ({
              id: client.id,
              name: client.Name || `Client ${client.id.substring(0, 5)}`
            }));

            // Add "All Clients" option at the beginning
            setAvailableClients([
              { id: 'all', name: 'All Clients' },
              ...clientOptions
            ]);

            // Set default client ID to 'all' only if clientId is not set
            if (!clientId) {
              setClientId('all');
            }
          }
        } catch (error) {
          console.error('Error fetching clients:', error);

          // Fallback for client users
          if (user.Client && user.Role === 'Client') {
            const clientIds = Array.isArray(user.Client) ? user.Client : [user.Client];
            const clients = clientIds.map(id => ({
              id,
              name: `Client ${id.substring(0, 5)}` // Use part of ID as name for demo
            }));

            setAvailableClients(clients);

            if (clients.length > 0 && !clientId) {
              setClientId(clients[0].id);
            }
          } else if (user.Role === 'Admin') {
            // Fallback for admin users
            setAvailableClients([
              { id: 'all', name: 'All Clients' }
            ]);

            if (!clientId) {
              setClientId('all');
            }
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchClientData();
    }
  }, [user]);

  // Function to filter data by client and user permissions
  const filterDataByClient = <T extends {
    Client?: string | string[];
    'All Clients'?: string | string[];
    AssignedTo?: string | string[];
    Writer?: string | string[];
    Editor?: string | string[];
    SEOStrategist?: string | string[];
    ContentWriter?: string | string[];
    ContentEditor?: string | string[]
  }>(data: T[]): T[] => {
    console.log('filterDataByClient called with data length:', data.length);
    console.log('Current user:', user?.Name, 'Role:', user?.Role);
    console.log('Selected clientId:', clientId);

    // If no user is logged in, return empty array
    if (!user) {
      console.log('No user logged in, returning empty array');
      return [];
    }

    // If user is admin
    if (user.Role === 'Admin') {
      console.log('User is admin');
      // If 'all' is selected or no client is selected, return all data
      if (!clientId || clientId === 'all') {
        console.log('All clients selected, returning all data');
        return data;
      }

      console.log('Admin filtering by specific client:', clientId);
      // If a specific client is selected, filter by that client
      const filtered = data.filter(item => {
        // Check 'All Clients' field first
        if (item['All Clients']) {
          if (Array.isArray(item['All Clients'])) {
            const includes = item['All Clients'].includes(clientId);
            console.log('Item All Clients is array:', item['All Clients'], 'includes clientId:', includes);
            return includes;
          } else {
            const matches = item['All Clients'] === clientId;
            console.log('Item All Clients is string:', item['All Clients'], 'matches clientId:', matches);
            return matches;
          }
        }

        // Fall back to Client field if 'All Clients' is not present
        if (!item.Client) {
          console.log('Item has no Client field:', item);
          return false;
        }

        if (Array.isArray(item.Client)) {
          const includes = item.Client.includes(clientId);
          console.log('Item Client is array:', item.Client, 'includes clientId:', includes);
          return includes;
        } else {
          const matches = item.Client === clientId;
          console.log('Item Client is string:', item.Client, 'matches clientId:', matches);
          return matches;
        }
      });

      console.log('Filtered data length:', filtered.length);
      return filtered;
    }

    // For client users, filter by client ID
    if (user.Role === 'Client') {
      // If no client ID selected, use the first client ID from the user's clients
      const filterClientId = clientId || (Array.isArray(user.Client) && user.Client.length > 0 ? user.Client[0] : user.Client);

      if (!filterClientId) return [];

      return data.filter(item => {
        // Check 'All Clients' field first
        if (item['All Clients']) {
          if (Array.isArray(item['All Clients'])) {
            return item['All Clients'].includes(filterClientId);
          } else {
            return item['All Clients'] === filterClientId;
          }
        }

        // Fall back to Client field if 'All Clients' is not present
        if (!item.Client) return false;

        if (Array.isArray(item.Client)) {
          return item.Client.includes(filterClientId);
        } else {
          return item.Client === filterClientId;
        }
      });
    }

    // For other users (not admin or client), filter by assigned items
    // If no client ID is selected, filter by assignments
    if (!clientId) {
      return data.filter(item => {
        // Check if the item is assigned to this user in any capacity
        const isAssigned =
          // Check AssignedTo field (for tasks)
          (item.AssignedTo && (
            (Array.isArray(item.AssignedTo) && item.AssignedTo.includes(user.id)) ||
            (item.AssignedTo === user.id)
          )) ||
          // Check Writer field (for articles)
          (item.Writer && (
            (Array.isArray(item.Writer) && item.Writer.includes(user.id)) ||
            (item.Writer === user.id)
          )) ||
          // Check Editor field (for articles)
          (item.Editor && (
            (Array.isArray(item.Editor) && item.Editor.includes(user.id)) ||
            (item.Editor === user.id)
          )) ||
          // Check SEO Strategist field (for briefs)
          (item.SEOStrategist && (
            (Array.isArray(item.SEOStrategist) && item.SEOStrategist.includes(user.id)) ||
            (item.SEOStrategist === user.id)
          )) ||
          // Check Content Writer field (for briefs)
          (item.ContentWriter && (
            (Array.isArray(item.ContentWriter) && item.ContentWriter.includes(user.id)) ||
            (item.ContentWriter === user.id)
          )) ||
          // Check Content Editor field (for briefs)
          (item.ContentEditor && (
            (Array.isArray(item.ContentEditor) && item.ContentEditor.includes(user.id)) ||
            (item.ContentEditor === user.id)
          ));

        return isAssigned;
      });
    }

    // If a client ID is selected, filter by that client ID
    return data.filter(item => {
      // Check 'All Clients' field first
      if (item['All Clients']) {
        if (Array.isArray(item['All Clients'])) {
          return item['All Clients'].includes(clientId);
        } else {
          return item['All Clients'] === clientId;
        }
      }

      // Fall back to Client field if 'All Clients' is not present
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

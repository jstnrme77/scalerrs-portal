'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getClientName } from '@/utils/clientUtils';
import { clearCacheByPrefix } from '@/lib/client-cache';

interface ClientDataContextType {
  clientId: string | null;
  setClientId: (id: string | null) => void;
  availableClients: { id: string; name: string }[];
  isLoading: boolean;
  filterDataByClient: <T extends {
    client?: string | string[];
    Client?: string | string[];
    Clients?: string | string[];
    AssignedTo?: string | string[];
    Writer?: string | string[];
    Editor?: string | string[];
    SEOStrategist?: string | string[];
    ContentWriter?: string | string[];
    ContentEditor?: string | string[]
  }>(data: T[]) => T[];
  clearClientDataCache: () => void;
}

const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

export function ClientDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to clear client data cache
  const clearClientDataCache = () => {
    console.log('Clearing client data cache');
    // Clear all approvals cache
    clearCacheByPrefix('approvals_');
    // Clear other client-specific caches as needed
    clearCacheByPrefix('wqa-tasks_');
    clearCacheByPrefix('cro-tasks_');
  };

  // Clear cache when client ID changes
  useEffect(() => {
    if (clientId) {
      console.log(`Client ID changed to ${clientId}, clearing cache`);
      clearClientDataCache();
    }
  }, [clientId]);

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
          // If user has Clients field and is a Client role
          if (user.Clients && user.Role === 'Client') {
            // Ensure Clients is an array
            const clientIds = Array.isArray(user.Clients) ? user.Clients : [user.Clients];

            // Fetch all clients to get their names
            const { fetchClients } = await import('@/lib/client-api');
            const allClients = await fetchClients();

            // Filter clients to only include those assigned to this user
            const userClients = allClients
              .filter((client: { id: string; Name?: string }) => clientIds.includes(client.id))
              .map((client: { id: string; Name?: string }) => ({
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
            console.log('Fetching clients for admin user...');

            try {
              // Create an AbortController for the fetch request
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

              // Pass the signal to fetchClients
              const allClients = await fetchClients(controller.signal);
              clearTimeout(timeoutId);

              console.log('Successfully fetched clients:', allClients.length);

              // Clear any Airtable connection issues flag since we successfully fetched data
              if (typeof window !== 'undefined') {
                console.log('Clearing airtable-connection-issues flag');
                localStorage.removeItem('airtable-connection-issues');
                localStorage.removeItem('use-mock-data');
              }

              // Create client options with id and name
              const clientOptions = allClients.map((client: { id: string; Name?: string }) => ({
                id: client.id,
                name: client.Name || `Client ${client.id.substring(0, 5)}`
              }));

              console.log('Client options:', clientOptions);

              // Add "All Clients" option at the beginning
              setAvailableClients([
                { id: 'all', name: 'All Clients' },
                ...clientOptions
              ]);
            } catch (error) {
              console.error('Error fetching clients:', error);
              setIsLoading(false);

              // Set a fallback client list with just "All Clients"
              setAvailableClients([
                { id: 'all', name: 'All Clients' }
              ]);
            }

            // Set default client ID to 'all' only if clientId is not set
            if (!clientId) {
              setClientId('all');
            }
          }
        } catch (error) {
          console.error('Error fetching clients:', error);

          // Fallback for client users
          if (user.Clients && user.Role === 'Client') {
            const clientIds = Array.isArray(user.Clients) ? user.Clients : [user.Clients];
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

  // Helper function to check if an item matches the client ID
  const itemMatchesClient = (item: any, clientIdToMatch: string) => {
    // Check Clients field first (standard field)
    if (item.Clients) {
      if (Array.isArray(item.Clients)) {
        const includes = item.Clients.includes(clientIdToMatch);
        console.log('Item Clients is array:', item.Clients, 'includes clientId:', includes);
        return includes;
      } else {
        const matches = item.Clients === clientIdToMatch;
        console.log('Item Clients is string:', item.Clients, 'matches clientId:', matches);
        return matches;
      }
    }
    
    // Check Client field (uppercase) for Airtable data
    if (item.Client) {
      if (Array.isArray(item.Client)) {
        const includes = item.Client.includes(clientIdToMatch);
        console.log('Item Client is array:', item.Client, 'includes clientId:', includes);
        return includes;
      } else {
        const matches = item.Client === clientIdToMatch;
        console.log('Item Client is string:', item.Client, 'matches clientId:', matches);
        return matches;
      }
    }
    
    // Fall back to client field (lowercase) if others are not present
    if (item.client) {
      if (Array.isArray(item.client)) {
        const includes = item.client.includes(clientIdToMatch);
        console.log('Item client is array:', item.client, 'includes clientId:', includes);
        return includes;
      } else {
        const matches = item.client === clientIdToMatch;
        console.log('Item client is string:', item.client, 'matches clientId:', matches);
        return matches;
      }
    }
    
    // If neither field is present, return false
    console.log('Item has no client field:', item);
    return false;
  };

  // Function to filter data by client and user permissions
  const filterDataByClient = <T extends {
    client?: string | string[];
    Client?: string | string[];
    Clients?: string | string[];
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
      
      // Try to detect if we're filtering backlinks
      const isBacklinksData = data.length > 0 && 
        (data[0] as any).contentType === 'backlinks' || 
        (data[0] as any).domainRating !== undefined || 
        (data[0] as any).linkType !== undefined;
      
      if (isBacklinksData) {
        console.log('Detected backlinks data, using Client field instead of All Clients');
      }

      // Filter based on client ID and backlinks detection
      const filtered = data.filter(item => itemMatchesClient(item, clientId));
      console.log('Filtered data length:', filtered.length);
      return filtered;
    }

    // For client users, filter by client ID
    if (user.Role === 'Client') {
      console.log('[ClientDataContext] Client User Detected. User object:', JSON.parse(JSON.stringify(user)));
      console.log('[ClientDataContext] user.Clients raw:', user.Clients);

      // If no client ID selected, use the first client ID from the user's clients
      const filterClientId = clientId || (Array.isArray(user.Clients) && user.Clients.length > 0 ? user.Clients[0] : user.Clients);

      console.log('[ClientDataContext] Initial clientId from state:', clientId);
      console.log('[ClientDataContext] Calculated filterClientId:', filterClientId);

      if (!filterClientId) {
        console.log('[ClientDataContext] No filterClientId resolved, returning empty array.');
        return [];
      }

      console.log('Client user filtering by client ID:', filterClientId);
      console.log('Client user data:', user);
      console.log('Available clients for this user:', availableClients);
      
      // Try to detect if we're filtering backlinks
      const isBacklinksData = data.length > 0 && 
        (data[0] as any).contentType === 'backlinks' || 
        (data[0] as any).domainRating !== undefined || 
        (data[0] as any).linkType !== undefined;
      
      if (isBacklinksData) {
        console.log('Detected backlinks data, using Client field instead of All Clients');
      }
      
      // Filter based on client ID and backlinks detection
      const filteredData = data.filter(item => itemMatchesClient(item, filterClientId as string));
      console.log(`Filtered data for client ${filterClientId}: ${filteredData.length} items out of ${data.length}`);
      
      return filteredData;
    }

    // For other users (not admin or client), filter by assigned items
    // If no client ID is selected, filter by assignments
    if (!clientId) {
      console.log('Non-admin/client user with no client ID selected, filtering by assignments');
      
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
    console.log('Non-admin/client user with client ID selected, filtering by client:', clientId);
    
    // Try to detect if we're filtering backlinks
    const isBacklinksData = data.length > 0 && 
      (data[0] as any).contentType === 'backlinks' || 
      (data[0] as any).domainRating !== undefined || 
      (data[0] as any).linkType !== undefined;
    
    if (isBacklinksData) {
      console.log('Detected backlinks data, using Client field instead of All Clients');
    }
    
    // Filter based on client ID and backlinks detection
    return data.filter(item => itemMatchesClient(item, clientId));
  };

  return (
    <ClientDataContext.Provider
      value={{
        clientId,
        setClientId,
        availableClients,
        isLoading,
        filterDataByClient,
        clearClientDataCache
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

'use client';

import { useState, useEffect, useRef } from 'react';
import { useClientData } from '@/context/ClientDataContext';
import { useAuth } from '@/context/AuthContext';
import { fetchClients } from '@/lib/client-api';

interface ClientSelectorProps {
  className?: string;
}

export default function ClientSelector({ className = '' }: ClientSelectorProps) {
  const { user } = useAuth();
  const { clientId, setClientId, availableClients: contextClients, isLoading: contextLoading } = useClientData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Local state for clients in case we need to fetch them directly
  const [localClients, setLocalClients] = useState<{ id: string; name: string }[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localClientId, setLocalClientId] = useState<string | null>(null);

  // Use either context values or local values
  const availableClients = contextClients.length > 1 ? contextClients : localClients;
  const isLoading = contextLoading || localLoading;

  // Fetch clients directly if context doesn't provide them
  useEffect(() => {
    // Only fetch if user is admin and context doesn't have clients
    if (user?.Role === 'Admin' && contextClients.length <= 1 && !contextLoading) {
      const fetchClientData = async () => {
        try {
          setLocalLoading(true);
          console.log('Fetching clients directly from ClientSelector component');

          // Clear any Airtable connection issues flag
          if (typeof window !== 'undefined') {
            localStorage.removeItem('airtable-connection-issues');
            localStorage.removeItem('use-mock-data');
          }

          const allClients = await fetchClients();
          console.log('ClientSelector: Fetched clients directly:', allClients.length);

          // Create client options
          const clientOptions = allClients.map((client: { id: string; Name?: string }) => ({
            id: client.id,
            name: client.Name || `Client ${client.id.substring(0, 5)}`
          }));

          // Add "All Clients" option
          setLocalClients([
            { id: 'all', name: 'All Clients' },
            ...clientOptions
          ]);

          // Set default client ID if not already set
          if (!localClientId) {
            setLocalClientId('all');
          }
        } catch (error) {
          console.error('Error fetching clients directly:', error);
        } finally {
          setLocalLoading(false);
        }
      };

      fetchClientData();
    }
  }, [user, contextClients, contextLoading, localClientId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If user is not logged in, don't show selector
  if (!user) {
    return null;
  }

  // For non-admin users, only show if they have multiple clients
  if (user.Role !== 'Admin' && availableClients.length <= 1) {
    return null;
  }

  // Find the current client name
  const effectiveClientId = contextClients.length > 1 ? clientId : localClientId;
  const currentClient = availableClients.find(client => client.id === effectiveClientId);
  const currentClientName = currentClient ? currentClient.name : 'Select Client';

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ position: 'relative', zIndex: 10000 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 font-medium bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer rounded-full month-selector-rounded"
        style={{
          fontSize: '14px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          maxWidth: '140px'
        }}
      >
        <span className="truncate">{isLoading ? 'Loading...' : currentClientName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-down ml-1 h-3 w-3 flex-shrink-0"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 top-10 w-52 bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden client-selector-dropdown"
          style={{
            zIndex: 10000,
            position: 'absolute',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="py-1 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-gray-200" style={{ fontSize: '14px', zIndex: 10000 }}>
              Clients
            </div>
            {availableClients.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  // Use context or local state based on which one we're using
                  if (contextClients.length > 1) {
                    setClientId(client.id);
                  } else {
                    setLocalClientId(client.id);
                  }
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 text-gray-800 hover:bg-gray-50 cursor-pointer ${
                  effectiveClientId === client.id ? 'bg-gray-50' : ''
                }`}
                style={{ fontSize: '14px', zIndex: 10000 }}
              >
                {client.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

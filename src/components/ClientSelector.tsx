'use client';

import { useState, useEffect, useRef } from 'react';
import { useClientData } from '@/context/ClientDataContext';
import { useAuth } from '@/context/AuthContext';

interface ClientSelectorProps {
  className?: string;
}

export default function ClientSelector({ className = '' }: ClientSelectorProps) {
  const { user } = useAuth();
  const { clientId, setClientId, availableClients, isLoading } = useClientData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const currentClient = availableClients.find(client => client.id === clientId);
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
                  setClientId(client.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 text-gray-800 hover:bg-gray-50 cursor-pointer ${
                  clientId === client.id ? 'bg-gray-50' : ''
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

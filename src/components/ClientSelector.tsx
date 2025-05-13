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

  // If user is not an admin or there's only one client, don't show selector
  if (!user || user.Role !== 'Admin' && availableClients.length <= 1) {
    return null;
  }

  // Find the current client name
  const currentClient = availableClients.find(client => client.id === clientId);
  const currentClientName = currentClient ? currentClient.name : 'Select Client';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
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
        <div className="absolute right-0 top-10 w-52 bg-white shadow-lg z-50 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="py-1 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-gray-200" style={{ fontSize: '14px' }}>
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
                style={{ fontSize: '14px' }}
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

'use client';

import { useState, useEffect } from 'react';
import { resetMockDataFlags } from '@/lib/client-api';

export default function ResetMockDataButton() {
  const [showButton, setShowButton] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Check if we should show the button
  useEffect(() => {
    const hasApiConnectionIssues = localStorage.getItem('api-connection-issues') === 'true';
    const hasAirtableConnectionIssues = localStorage.getItem('airtable-connection-issues') === 'true';
    const hasApiErrorTimestamp = localStorage.getItem('api-error-timestamp') !== null;
    const useMockData = localStorage.getItem('use-mock-data') === 'true';
    
    setShowButton(hasApiConnectionIssues || hasAirtableConnectionIssues || hasApiErrorTimestamp || useMockData);
  }, []);
  
  const handleReset = () => {
    try {
      const result = resetMockDataFlags();
      setStatus(result ? 'success' : 'error');
      
      // Reload the page after a short delay
      if (result) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error resetting API connection flags:', error);
      setStatus('error');
    }
  };
  
  // Don't show anything if no flags are set
  if (!showButton) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
      {status === 'idle' && (
        <button 
          onClick={handleReset}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          Reset API Connection
        </button>
      )}
      
      {status === 'success' && (
        <div className="text-green-600 dark:text-green-400 text-xs px-2 py-1">
          Reloading...
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600 dark:text-red-400 text-xs px-2 py-1">
          Reset failed
        </div>
      )}
    </div>
  );
} 
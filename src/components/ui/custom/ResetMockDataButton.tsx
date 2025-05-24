'use client';

import { useState } from 'react';
import { resetMockDataFlags } from '@/lib/client-api';

export default function ResetMockDataButton() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleReset = () => {
    try {
      const result = resetMockDataFlags();
      setStatus(result ? 'success' : 'error');
      
      // Reload the page after a short delay
      if (result) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error resetting API connection flags:', error);
      setStatus('error');
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">API Settings</h3>
        
        {status === 'idle' && (
          <button 
            onClick={handleReset}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            Reset API Connection
          </button>
        )}
        
        {status === 'success' && (
          <div className="text-green-600 dark:text-green-400 text-sm">
            Reset successful! Reloading...
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            Failed to reset. Try again or check console.
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1">
          If API calls use mock data, click to reset
        </div>
      </div>
    </div>
  );
} 
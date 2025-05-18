'use client';

import { useState, useEffect } from 'react';
import { clearAirtableConnectionIssues } from '@/lib/client-api';

export default function AirtableDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStorageInfo, setLocalStorageInfo] = useState<Record<string, string>>({});

  // Check localStorage for Airtable connection issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const info: Record<string, string> = {};
      
      // Check for Airtable connection issues flags
      info['airtable-connection-issues'] = localStorage.getItem('airtable-connection-issues') || 'not set';
      info['api-error-timestamp'] = localStorage.getItem('api-error-timestamp') || 'not set';
      info['use-mock-data'] = localStorage.getItem('use-mock-data') || 'not set';
      
      // Check for environment variables
      info['NEXT_PUBLIC_USE_MOCK_DATA'] = process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'not set';
      info['NEXT_PUBLIC_AIRTABLE_API_KEY'] = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? 
        `${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY.substring(0, 10)}...` : 'not set';
      info['NEXT_PUBLIC_AIRTABLE_BASE_ID'] = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'not set';
      
      // Check if we're on Netlify
      info['isNetlify'] = window.location.hostname.includes('netlify.app') ? 'true' : 'false';
      
      setLocalStorageInfo(info);
    }
  }, [isOpen]);

  // Function to fetch debug info from Netlify function
  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine if we're on Netlify
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
      
      // Use the appropriate API endpoint based on the environment
      const debugUrl = isNetlify ? '/.netlify/functions/debug-env' : '/api/debug-env';
      
      const response = await fetch(debugUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (err: any) {
      console.error('Error fetching debug info:', err);
      setError(err.message || 'Failed to fetch debug info');
    } finally {
      setLoading(false);
    }
  };

  // Function to clear Airtable connection issues
  const handleClearConnectionIssues = () => {
    const cleared = clearAirtableConnectionIssues();
    if (cleared) {
      // The page will reload automatically
    } else {
      setError('Failed to clear connection issues');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Debug button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
      >
        {isOpen ? 'Close Debug' : 'Debug'}
      </button>

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Airtable Connection Debug</h2>
            
            {/* LocalStorage info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">LocalStorage Flags</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                {Object.entries(localStorageInfo).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={handleClearConnectionIssues}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Clear Connection Issues & Reload
              </button>
              
              <button
                onClick={fetchDebugInfo}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Fetch Netlify Debug Info'}
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Debug info */}
            {debugInfo && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Netlify Debug Info</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Close button */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

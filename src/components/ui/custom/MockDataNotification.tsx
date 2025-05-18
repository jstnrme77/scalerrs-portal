'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * A notification component that shows when the application is using mock data
 * due to Airtable connection issues or other errors.
 */
export default function MockDataNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Check if we're using mock data
    const usingMockData = localStorage.getItem('using-mock-data') === 'true';
    const mockDataReason = localStorage.getItem('mock-data-reason') || 'Unknown reason';
    
    setIsVisible(usingMockData);
    setReason(mockDataReason);
    
    // Clear the flag after 1 hour
    const clearMockDataFlag = () => {
      localStorage.removeItem('using-mock-data');
      localStorage.removeItem('mock-data-reason');
      setIsVisible(false);
    };
    
    // Set a timeout to clear the flag
    const timeoutId = setTimeout(clearMockDataFlag, 60 * 60 * 1000); // 1 hour
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 text-amber-800">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            Using sample data
          </p>
          <p className="mt-1 text-sm">
            {reason}. Data shown may not reflect current Airtable content.
          </p>
        </div>
        <button
          type="button"
          className="ml-3 flex-shrink-0 inline-flex text-amber-500 hover:text-amber-700"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

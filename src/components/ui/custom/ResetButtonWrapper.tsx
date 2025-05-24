'use client';

import { useEffect } from 'react';
import { resetMockDataFlags } from '@/lib/client-api';

export default function ResetButtonWrapper() {
  // Automatically reset flags when component mounts
  useEffect(() => {
    // Check if there are any flags set
    const hasApiConnectionIssues = localStorage.getItem('api-connection-issues') === 'true';
    const hasAirtableConnectionIssues = localStorage.getItem('airtable-connection-issues') === 'true';
    const hasApiErrorTimestamp = localStorage.getItem('api-error-timestamp') !== null;
    const useMockData = localStorage.getItem('use-mock-data') === 'true';
    
    // If any flags are set, reset them
    if (hasApiConnectionIssues || hasAirtableConnectionIssues || hasApiErrorTimestamp || useMockData) {
      console.log('Found API connection flags - automatically resetting...');
      resetMockDataFlags();
      
      // Reload the page to apply changes
      window.location.reload();
    } else {
      console.log('No API connection flags found - no reset needed');
    }
  }, []);
  
  // Return null (no visible UI)
  return null;
} 
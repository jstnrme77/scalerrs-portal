import { mockYouTube } from '@/lib/mock-data';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to determine if we're on Netlify or Vercel
const isNetlify = () => {
  if (!isBrowser) return false;

  // Check for Netlify hostname only
  return window.location.hostname.includes('netlify.app');
};

// Function to determine if we should use mock data
const shouldUseMockData = () => {
  if (!isBrowser) return false;

  // Check if mock data is explicitly enabled
  const useMockData =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
    (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_USE_MOCK_DATA === 'true') ||
    (typeof window !== 'undefined' && localStorage.getItem('use-mock-data') === 'true');

  // Check if we've had API connection issues
  const hasConnectionIssues = localStorage.getItem('api-connection-issues') === 'true';

  // Check if we've had recent API errors
  const hasRecentApiErrors =
    localStorage.getItem('api-error-timestamp') &&
    Date.now() - parseInt(localStorage.getItem('api-error-timestamp') || '0') < 60000; // Within last minute

  // Return true if we should use mock data
  return useMockData || hasConnectionIssues || hasRecentApiErrors;
};

// Youtube Scripts API
export async function fetchYoutubeScripts(month?: string) {
  // Use mock data if explicitly enabled
  if (shouldUseMockData()) {
    console.log('Using mock YouTube data');
    return mockYouTube;
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access for YouTube scripts');
      const { getYouTubeData } = await import('@/lib/airtable');

      // Get current user from localStorage
      const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

      // If user is logged in, pass user info to getYouTubeData
      if (currentUser) {
        try {
          // Ensure Client is an array
          const clientIds = Array.isArray(currentUser.Clients) ? currentUser.Clients :
                          (currentUser.Clients ? [currentUser.Clients] : []);
          console.log('Calling getYouTubeData with user ID:', currentUser.id, 'role:', currentUser.Role, 'clientIds:', clientIds, 'month:', month);
          const youtubeData = await getYouTubeData(currentUser.id, currentUser.Role, clientIds, month);
          console.log('Received YouTube data from Airtable:', youtubeData.length);
          
          // Log detailed information about the YouTube data
          if (youtubeData.length > 0) {
            console.log('Sample YouTube record:', {
              id: youtubeData[0].id,
              keyword: youtubeData[0]['Keyword Topic'],
              month: youtubeData[0]['Target Month'],
              status: youtubeData[0]['Script Status for Deliverables']
            });
            console.log('All YouTube months:', youtubeData.map((item: any) => item['Target Month']));
            console.log('All YouTube statuses:', youtubeData.map((item: any) => item['Script Status for Deliverables']));
            
            // Count records by status
            const statusCounts: Record<string, number> = {};
            youtubeData.forEach((item: any) => {
              const status = item['Script Status for Deliverables'] || 'Unknown';
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            console.log('YouTube status counts:', statusCounts);
            
          } else {
            console.log('No YouTube data received from Airtable');
          }
          
          return youtubeData;
        } catch (airtableError: any) {
          console.error('Error fetching YouTube data from Airtable:', airtableError);

          // Record the error timestamp
          if (isBrowser) {
            localStorage.setItem('api-error-timestamp', Date.now().toString());
            localStorage.setItem('use-mock-data', 'true');
          }

          // If we get a 403 error, fall back to mock data
          console.log('Falling back to mock YouTube data due to Airtable error');
          return mockYouTube;
        }
      } else {
        // If no user is logged in, return empty array
        console.log('No user logged in, returning empty YouTube data list');
        return [];
      }
    }

    // In production, always use the Next.js API routes
    let url = '/api/youtube';

    // Add month parameter to URL if provided
    if (month) {
      url += `?month=${encodeURIComponent(month)}`;
    }

    console.log('Fetching YouTube scripts from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Get current user from localStorage
    const currentUser = isBrowser ? JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

    // Prepare headers with user information
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };

    // Add user information to headers if available
    if (currentUser) {
      headers['x-user-id'] = currentUser.id;
      headers['x-user-role'] = currentUser.Role;

      // Convert client array to JSON string
      if (currentUser.Clients) {
        // Ensure Client is an array
        const clientIds = Array.isArray(currentUser.Clients) ? currentUser.Clients : [currentUser.Clients];
        headers['x-user-clients'] = JSON.stringify(clientIds);
      } else {
        headers['x-user-clients'] = JSON.stringify([]);
      }
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('YouTube scripts data received:', data);
    
    // If no YouTube scripts found with client filtering, try fetching all scripts with admin privileges
    if (data.youtube && data.youtube.length === 0 && month) {
      console.log('No YouTube scripts found with client filtering, fetching all scripts');
      
      const adminHeaders = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'x-user-id': 'bypass-client-filter',
        'x-user-role': 'Admin'
      };
      
      const adminResponse = await fetch(url, {
        headers: adminHeaders,
      });
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('All YouTube scripts data received:', adminData);
        return adminData.youtube;
      }
    }
    
    return data.youtube;
  } catch (error) {
    console.error('Error fetching YouTube scripts:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isNetlify() && isBrowser) {
      localStorage.setItem('airtable-connection-issues', 'true');
    }

    // Fall back to mock data
    console.log('Falling back to mock YouTube data');
    return mockYouTube;
  }
} 
'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { updateBriefStatus, updateArticleStatus } from '@/lib/client-api';
import { BriefBoard, ArticleBoard, YouTubeBoard, RedditBoard } from '@/components/kanban/KanbanBoard';
import { BriefStatus, ArticleStatus, YouTubeStatus, RedditStatus } from '@/types';
import DocumentViewerModal from '@/components/modals/DocumentViewerModal';
import useDocumentViewer from '@/hooks/useDocumentViewer';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { FileText, BookOpen, Video, MessageSquare } from 'lucide-react';
import { useClientData } from '@/context/ClientDataContext';
import { initializeClientCache } from '@/utils/clientUtils';
import RoundedMonthSelector from '@/components/ui/custom/RoundedMonthSelector';
import MockDataNotification from '@/components/ui/custom/MockDataNotification';
import '@/styles/kanban.css';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'youtube' | 'reddit';

export default function ContentWorkflowPage() {
  const [mainTab, setMainTab] = useState<MainTab>('briefs');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Get current month and year for default selection
  const getCurrentMonthYear = () => {
    const date = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const { clientId, filterDataByClient } = useClientData();

  // State for Airtable data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [youtube, setYoutube] = useState<any[]>([]);
  const [reddit, setReddit] = useState<any[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [filteredYoutube, setFilteredYoutube] = useState<any[]>([]);
  const [filteredReddit, setFilteredReddit] = useState<any[]>([]);

  // Use the document viewer hook
  const { documentModal, openDocumentViewer, closeDocumentViewer } = useDocumentViewer();

  // Reference to the sticky tab navigation
  const stickyTabRef = useRef<HTMLDivElement>(null);

  // Debug function to log data
  const logData = (data: any[], type: string) => {
    console.log(`${type} data:`, data);
    if (data.length > 0) {
      console.log(`First ${type} item:`, data[0]);
      console.log(`${type} fields:`, Object.keys(data[0]));
      console.log(`${type} Status:`, data[0].Status);
      console.log(`${type} DueDate:`, data[0].DueDate);
    } else {
      console.log(`No ${type} data available`);
    }
  };

  // Fetch data from Airtable
  useEffect(() => {
    const fetchData = async () => {
      // Check if we're in a browser environment
      const isBrowser = typeof window !== 'undefined';

      try {
        setLoading(true);
        setError(null);

        console.log('Starting to fetch content workflow data...');
        console.log('Fetching data for month:', selectedMonth);

        // Initialize client cache first to ensure client names are available
        try {
          await initializeClientCache();
          console.log('Client cache initialized for content workflow');
        } catch (cacheError) {
          console.error('Error initializing client cache:', cacheError);
        }

        // Clear any existing mock data flag to ensure we're using real data
        if (isBrowser) {
          localStorage.removeItem('use-mock-data');
          localStorage.removeItem('using-mock-data');
          localStorage.removeItem('mock-data-reason');
        }

        // Fetch each data type separately to better handle errors
        let briefsData = [];
        let articlesData = [];
        let youtubeData = [];
        let redditData = [];
        let hasErrors = false;
        const errorMessages = [];

        try {
          console.log('Fetching briefs from Airtable for month:', selectedMonth);

          // Create a controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Fetch briefs timeout after 20 seconds');
            controller.abort();
          }, 20000);

          // Use Next.js API routes in Vercel environment
          let url = '/api/briefs';
          if (selectedMonth) {
            url += `?month=${encodeURIComponent(selectedMonth)}`;
          }

          console.log('Fetching briefs from API route:', url);

          // Get current user from localStorage
          const currentUser = typeof window !== 'undefined' ?
            JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

          // Prepare headers with user information
          const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          };

          // Add user information to headers if available
          if (currentUser) {
            console.log('Adding user headers for briefs fetch:', currentUser.id, currentUser.Role);
            headers['x-user-id'] = currentUser.id || '';
            headers['x-user-role'] = currentUser.Role || '';

            // Convert client to JSON string if it's an array - use Clients field
            if (currentUser.Clients) {
              const clientIds = Array.isArray(currentUser.Clients)
                ? currentUser.Clients
                : [currentUser.Clients];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding client header:', JSON.stringify(clientIds));
            } else if (currentUser.Client) {
              // Fallback to legacy Client field if Clients doesn't exist
              const clientIds = Array.isArray(currentUser.Client)
                ? currentUser.Client
                : [currentUser.Client];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding legacy client header:', JSON.stringify(clientIds));
            } else {
              headers['x-user-clients'] = JSON.stringify([]);
              console.log('No client data found for user, adding empty client header');
            }
          } else {
            console.log('No user found in localStorage');
          }

          const response = await fetch(url, {
            signal: controller.signal,
            headers
          });

          // Clear the timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log('Briefs data received:', data);

          briefsData = data.briefs || [];
          console.log('Briefs fetched successfully:', briefsData.length, 'records');
          logData(briefsData, 'Briefs');
          setBriefs(briefsData);
        } catch (briefsErr: any) {
          console.error('Error fetching briefs:', briefsErr);

          // Log detailed error information
          console.error('Error details:', briefsErr.message || 'Unknown error');
          if (briefsErr.stack) {
            console.error('Error stack:', briefsErr.stack);
          }

          errorMessages.push(`Briefs: ${briefsErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Set empty array instead of using mock data
            setBriefs([]);
        }

        try {
          console.log('Fetching articles from Airtable for month:', selectedMonth);

          // Create a controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Fetch articles timeout after 20 seconds');
            controller.abort();
          }, 20000);

          // Use Next.js API routes in Vercel environment
          let url = '/api/articles';
          if (selectedMonth) {
            url += `?month=${encodeURIComponent(selectedMonth)}`;
          }

          console.log('Fetching articles from API route:', url);

          // Get current user from localStorage
          const currentUser = typeof window !== 'undefined' ?
            JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

          // Prepare headers with user information
          const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          };

          // Add user information to headers if available
          if (currentUser) {
            console.log('Adding user headers for articles fetch:', currentUser.id, currentUser.Role);
            headers['x-user-id'] = currentUser.id || '';
            headers['x-user-role'] = currentUser.Role || '';

            // Convert client to JSON string if it's an array
            if (currentUser.Clients) {
              const clientIds = Array.isArray(currentUser.Clients)
                ? currentUser.Clients
                : [currentUser.Clients];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding client header:', JSON.stringify(clientIds));
            } else if (currentUser.Client) {
              // Fallback to legacy Client field if Clients doesn't exist
              const clientIds = Array.isArray(currentUser.Client)
                ? currentUser.Client
                : [currentUser.Client];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding legacy client header:', JSON.stringify(clientIds));
            } else {
              headers['x-user-clients'] = JSON.stringify([]);
              console.log('No client data found for user, adding empty client header');
            }
          } else {
            console.log('No user found in localStorage');
          }

          const response = await fetch(url, {
            signal: controller.signal,
            headers
          });

          // Clear the timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log('Articles data received:', data);

          articlesData = data.articles || [];
          console.log('Articles fetched successfully:', articlesData.length, 'records');
          logData(articlesData, 'Articles');
          setArticles(articlesData);
        } catch (articlesErr: any) {
          console.error('Error fetching articles:', articlesErr);

          // Log detailed error information
          console.error('Error details:', articlesErr.message || 'Unknown error');
          if (articlesErr.stack) {
            console.error('Error stack:', articlesErr.stack);
          }

          errorMessages.push(`Articles: ${articlesErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Set empty array instead of using mock data
          setArticles([]);
        }

        try {
          console.log('Fetching youtube from Airtable for month:', selectedMonth);

          // Create a controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Fetch youtube timeout after 20 seconds');
            controller.abort();
          }, 20000);

          // Use Next.js API routes in Vercel environment
          let url = '/api/youtube';
          if (selectedMonth) {
            url += `?month=${encodeURIComponent(selectedMonth)}`;
            console.log('YouTube API request with month parameter:', url);
          }

          console.log('Fetching youtube from API route:', url);

          // Get current user from localStorage
          const currentUser = typeof window !== 'undefined' ?
            JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

          // Add client record ID to headers if we have a specific client selected
          const currentClientId = typeof window !== 'undefined' ? 
            localStorage.getItem('clientRecordID') : null;
          
          // Prepare headers with user information
          const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          };
          
          // Add client record ID to headers if available
          if (currentClientId) {
            headers['x-client-record-id'] = currentClientId;
            console.log('Adding client record ID to YouTube request:', currentClientId);
          }

          // Add user information to headers if available
          if (currentUser) {
            console.log('Adding user headers for youtube fetch:', currentUser.id, currentUser.Role);
            headers['x-user-id'] = currentUser.id || '';
            headers['x-user-role'] = currentUser.Role || '';

            // Try to get clientRecordID from localStorage first
            try {
              const clientRecordID = localStorage.getItem('clientRecordID');
              if (clientRecordID) {
                headers['x-client-record-id'] = clientRecordID;
                console.log('Adding client record ID to header:', clientRecordID);
              } else {
                console.log('No clientRecordID found in localStorage');
              }
            } catch (e) {
              console.error('Error reading clientRecordID from localStorage:', e);
            }

            // Convert client to JSON string if it's an array
            if (currentUser.Clients) {
              const clientIds = Array.isArray(currentUser.Clients)
                ? currentUser.Clients
                : [currentUser.Clients];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding client header:', JSON.stringify(clientIds));
            } else if (currentUser.Client) {
              // Fallback to legacy Client field if Clients doesn't exist
              const clientIds = Array.isArray(currentUser.Client)
                ? currentUser.Client
                : [currentUser.Client];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding legacy client header:', JSON.stringify(clientIds));
            } else {
              headers['x-user-clients'] = JSON.stringify([]);
              console.log('No client data found for user, adding empty client header');
            }
          } else {
            console.log('No user found in localStorage');
          }

          const response = await fetch(url, {
            signal: controller.signal,
            headers
          });

          // Clear the timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log('Youtube data received:', data);

          youtubeData = data.youtube || [];
          console.log('Youtube fetched successfully:', youtubeData.length, 'records');
          logData(youtubeData, 'Youtube');
          setYoutube(youtubeData);
        } catch (youtubeErr: any) {
          console.error('Error fetching youtube:', youtubeErr);

          // Log detailed error information
          console.error('Error details:', youtubeErr.message || 'Unknown error');
          if (youtubeErr.stack) {
            console.error('Error stack:', youtubeErr.stack);
          }

          errorMessages.push(`Youtube: ${youtubeErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Set empty array instead of using mock data
          setYoutube([]);
        }

        try {
          console.log('Fetching reddit from Airtable for month:', selectedMonth);

          // Create a controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Fetch reddit timeout after 20 seconds');
            controller.abort();
          }, 20000);

          // Use Next.js API routes in Vercel environment
          let url = '/api/reddit';
          if (selectedMonth) {
            url += `?month=${encodeURIComponent(selectedMonth)}`;
          }

          console.log('Fetching reddit from API route:', url);

          // Get current user from localStorage
          const currentUser = typeof window !== 'undefined' ?
            JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;

          // Add client record ID to headers if we have a specific client selected
          const currentClientId = typeof window !== 'undefined' ? 
            localStorage.getItem('clientRecordID') : null;
          
          // Prepare headers with user information
          const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          };
          
          // Add client record ID to headers if available
          if (currentClientId) {
            headers['x-client-record-id'] = currentClientId;
            console.log('Adding client record ID to Reddit request:', currentClientId);
          }

          // Add user information to headers if available
          if (currentUser) {
            console.log('Adding user headers for reddit fetch:', currentUser.id, currentUser.Role);
            headers['x-user-id'] = currentUser.id || '';
            headers['x-user-role'] = currentUser.Role || '';

            // Convert client to JSON string if it's an array
            if (currentUser.Clients) {
              const clientIds = Array.isArray(currentUser.Clients)
                ? currentUser.Clients
                : [currentUser.Clients];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding client header:', JSON.stringify(clientIds));
            } else if (currentUser.Client) {
              // Fallback to legacy Client field if Clients doesn't exist
              const clientIds = Array.isArray(currentUser.Client)
                ? currentUser.Client
                : [currentUser.Client];
              headers['x-user-clients'] = JSON.stringify(clientIds);
              console.log('Adding legacy client header:', JSON.stringify(clientIds));
            } else {
              headers['x-user-clients'] = JSON.stringify([]);
              console.log('No client data found for user, adding empty client header');
            }
          } else {
            console.log('No user found in localStorage');
          }

          const response = await fetch(url, {
            signal: controller.signal,
            headers
          });

          // Clear the timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log('Reddit data received:', data);

          redditData = data.reddit || [];
          console.log('Reddit fetched successfully:', redditData.length, 'records');
          logData(redditData, 'Reddit');
          setReddit(redditData);
        } catch (redditErr: any) {
          console.error('Error fetching reddit:', redditErr);

          // Log detailed error information
          console.error('Error details:', redditErr.message || 'Unknown error');
          if (redditErr.stack) {
            console.error('Error stack:', redditErr.stack);
          }

          errorMessages.push(`Reddit: ${redditErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Set empty array instead of using mock data
          setReddit([]);
        }

        // Set error message if any of the fetches failed
        if (hasErrors) {
          setError(`Some data could not be fetched: ${errorMessages.join('; ')}. Please check your Airtable connection.`);
        }
      } catch (err: Error | unknown) {
        console.error('Error in content workflow data fetching:', err);

        let errorMessage = 'Unknown error';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = (err as { message: string }).message;
        }

        setError(`An error occurred while fetching content workflow data: ${errorMessage}`);

        // Clear the data states
        setBriefs([]);
        setArticles([]);
        setYoutube([]);
        setReddit([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Listen for changes in sidebar state
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };

    window.addEventListener('sidebarToggle' as any, handleSidebarChange);

    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarChange);
    };
  }, []);

  // Add scroll effect for sticky tab navigation
  useEffect(() => {
    const handleScroll = () => {
      if (stickyTabRef.current) {
        if (window.scrollY > 100) {
          stickyTabRef.current.classList.add('scrolled');
        } else {
          stickyTabRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Filter data by selected month and client
  useEffect(() => {
    console.log('Filtering data for month:', selectedMonth);
    console.log('Filtering data for client:', clientId);
    console.log('Current briefs data length:', briefs.length);
    console.log('Current articles data length:', articles.length);
    console.log('Current youtube data length:', youtube.length);
    console.log('Current reddit data length:', reddit.length);

    // Debug YouTube data for month filtering
    if (youtube.length > 0) {
      console.log('YouTube data month debugging:');
      // Log the first few YouTube items with their Target Month field
      youtube.slice(0, 3).forEach((video, index) => {
        console.log(`YouTube item ${index}:`, {
          id: video.id,
          title: video['Video Title'] || video['Keyword Topic'],
          targetMonth: video['Target Month'],
          status: video['YouTube Status'],
          clients: video['Clients']
        });
      });
    }

    // Log the first few briefs to see what we're working with
    if (briefs.length > 0) {
      console.log('First 3 briefs:', briefs.slice(0, 3));
    } else {
      console.log('No briefs data available');
    }

    // Filter briefs by month and client
    if (briefs.length > 0) {
      // First filter by client
      const clientFiltered = filterDataByClient(briefs);
      console.log('Client filtered briefs:', clientFiltered.length);

      // No need to filter by month anymore since we're filtering at the database level
      const filtered = clientFiltered;

      setFilteredBriefs(filtered);
      console.log('Filtered briefs after month filter:', filtered.length);
    }

    // Filter articles by month and client
    if (articles.length > 0) {
      // First filter by client
      const clientFiltered = filterDataByClient(articles);
      console.log('Client filtered articles:', clientFiltered.length);

      // No need to filter by month anymore since we're filtering at the database level
      const filtered = clientFiltered;

      setFilteredArticles(filtered);
      console.log('Filtered articles after month filter:', filtered.length);
    }

    // Filter youtube by month and client
    if (youtube.length > 0) {
      // First filter by client - strictly filtering by client ID
      const clientFiltered = filterDataByClient(youtube);
      console.log('Client filtered youtube:', clientFiltered.length);

      // Strictly use only videos that match the client ID
      let filtered = clientFiltered;
      if (clientFiltered.length === 0 && clientId) {
        console.log('No YouTube videos found for current client. Showing empty list.');
        // Return empty array instead of all videos
        filtered = [];
      }

      // Now filter by month - only show videos with matching Target Month
      if (filtered.length > 0 && selectedMonth) {
        console.log('Filtering YouTube videos by Target Month:', selectedMonth);
        
        const monthFiltered = filtered.filter(video => {
          // If video has no Target Month, it doesn't match
          if (!video['Target Month']) return false;
          
          // Check for exact match
          if (video['Target Month'] === selectedMonth) return true;
          
          // Check if Target Month is an array that includes the selected month
          if (Array.isArray(video['Target Month']) && video['Target Month'].includes(selectedMonth)) return true;
          
          // Check if Target Month contains the selected month as a string
          if (typeof video['Target Month'] === 'string' && video['Target Month'].includes(selectedMonth)) return true;
          
          // Check for month name only match (e.g., "May" in "May 2025")
          const monthName = selectedMonth.split(' ')[0];
          if (monthName && video['Target Month'].includes(monthName)) return true;
          
          // No match found
          return false;
        });
        
        console.log(`YouTube videos after month filtering: ${monthFiltered.length} of ${filtered.length}`);
        filtered = monthFiltered;
      }

      // Debug Target Month values in YouTube data
      console.log('Selected month for filtering:', selectedMonth);
      if (filtered.length > 0) {
        console.log('YouTube Target Month values:');
        filtered.slice(0, 3).forEach((video, index) => {
          console.log(`Video ${index} Target Month:`, {
            targetMonth: video['Target Month'],
            comparison: {
              exactMatch: video['Target Month'] === selectedMonth,
              includes: video['Target Month'] ? video['Target Month'].includes(selectedMonth) : false,
              monthOnly: video['Target Month'] ? video['Target Month'].includes(selectedMonth.split(' ')[0]) : false
            }
          });
        });
      }

      setFilteredYoutube(filtered);
      console.log('Filtered youtube after client and month filter:', filtered.length);
      
      // Log the month field name being used for YouTube
      if (filtered.length > 0) {
        console.log('YouTube month field example:', filtered[0]['Target Month']);
      } else {
        if (clientId) {
          console.log(`No YouTube data found for client ID: ${clientId} - Data filtered out as requested`);
        } else if (selectedMonth) {
          console.log(`No YouTube data matching month: ${selectedMonth} - Data filtered out as requested`);
        } else {
          console.log('No YouTube data after filtering');
        }
      }
    }

    // Filter reddit by month and client
    if (reddit.length > 0) {
      // First filter by client - strictly filtering by client ID
      const clientFiltered = filterDataByClient(reddit);
      console.log('Client filtered reddit:', clientFiltered.length);

      // Strictly use only threads that match the client ID
      let filtered = clientFiltered;
      if (clientFiltered.length === 0 && clientId) {
        console.log('No Reddit threads found for current client. Showing empty list.');
        // Return empty array instead of all threads
        filtered = [];
      }

      // Now filter by month - only show threads with matching Month field
      if (filtered.length > 0 && selectedMonth) {
        console.log('Filtering Reddit threads by Month field:', selectedMonth);
        
        const monthFiltered = filtered.filter(thread => {
          // If thread has no Month field, it doesn't match
          if (!thread['Month']) return false;
          
          // Check for exact match
          if (thread['Month'] === selectedMonth) return true;
          
          // Check if Month is an array that includes the selected month
          if (Array.isArray(thread['Month']) && thread['Month'].includes(selectedMonth)) return true;
          
          // Check if Month contains the selected month as a string
          if (typeof thread['Month'] === 'string' && thread['Month'].includes(selectedMonth)) return true;
          
          // Check for month name only match (e.g., "May" in "May 2025")
          const monthName = selectedMonth.split(' ')[0];
          if (monthName && thread['Month'].includes(monthName)) return true;
          
          // No match found
          return false;
        });
        
        console.log(`Reddit threads after month filtering: ${monthFiltered.length} of ${filtered.length}`);
        filtered = monthFiltered;
      }

      // Debug client data in Reddit threads
      if (filtered.length > 0) {
        console.log('Reddit client data debug:');
        filtered.slice(0, 3).forEach((thread: any, index: number) => {
          console.log(`Thread ${index} client data:`, {
            id: thread.id,
            keyword: thread['Keyword'],
            clients: thread['Clients'],
            clientsType: thread['Clients'] ? typeof thread['Clients'] : 'undefined',
            isArray: Array.isArray(thread['Clients']),
            hasClientId: Array.isArray(thread['Clients']) && thread['Clients'].includes(clientId)
          });
        });
      }

      // Debug Month values in Reddit data
      console.log('Selected month for filtering:', selectedMonth);
      if (filtered.length > 0) {
        console.log('Reddit Month values:');
        filtered.slice(0, 3).forEach((thread: any, index: number) => {
          console.log(`Thread ${index} Month:`, {
            month: thread['Month'],
            comparison: {
              exactMatch: thread['Month'] === selectedMonth,
              includes: thread['Month'] ? thread['Month'].includes(selectedMonth) : false,
              monthOnly: thread['Month'] ? thread['Month'].includes(selectedMonth.split(' ')[0]) : false
            }
          });
        });
      }

      setFilteredReddit(filtered);
      console.log('Filtered reddit after client and month filter:', filtered.length);
      
      // Log the month field name being used for Reddit
      if (filtered.length > 0) {
        console.log('Reddit month field example:', filtered[0]['Month']);
      } else {
        if (clientId) {
          console.log(`No Reddit data found for client ID: ${clientId} - Data filtered out as requested`);
        } else if (selectedMonth) {
          console.log(`No Reddit data matching month: ${selectedMonth} - Data filtered out as requested`);
        } else {
          console.log('No Reddit data after filtering');
        }
      }
    }
  }, [selectedMonth, briefs, articles, youtube, reddit, clientId, filterDataByClient]);

  // Handle brief status changes
  const handleBriefStatusChange = async (briefId: string, newStatus: BriefStatus) => {
    try {
      console.log(`Attempting to update brief ${briefId} status to ${newStatus}...`);

      // Update the status in Airtable
      const updatedBrief = await updateBriefStatus(briefId, newStatus);
      console.log('Updated brief:', updatedBrief);

      // Update the local state
      setBriefs(prevBriefs =>
        prevBriefs.map(brief =>
          brief.id === briefId ? { ...brief, Status: newStatus } : brief
        )
      );

      console.log(`Brief ${briefId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating brief status:', error);

      // Update the local state anyway to provide a good user experience
      setBriefs(prevBriefs =>
        prevBriefs.map(brief =>
          brief.id === briefId ? { ...brief, Status: newStatus } : brief
        )
      );

      // Show an error message to the user
      setError('Could not update brief status in Airtable. Changes are saved locally only.');
    }
  };

  // Handle article status changes
  const handleArticleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    try {
      console.log(`Attempting to update article ${articleId} status to ${newStatus}...`);

      // Update the status in Airtable
      const updatedArticle = await updateArticleStatus(articleId, newStatus);
      console.log('Updated article:', updatedArticle);

      // Update the local state
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === articleId ? { ...article, Status: newStatus } : article
        )
      );

      console.log(`Article ${articleId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating article status:', error);

      // Update the local state anyway to provide a good user experience
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === articleId ? { ...article, Status: newStatus } : article
        )
      );

      // Show an error message to the user
      setError('Could not update article status in Airtable. Changes are saved locally only.');
    }
  };

  // Handle YouTube status changes
  const handleYouTubeStatusChange = async (videoId: string, newStatus: YouTubeStatus) => {
    try {
      console.log(`Attempting to update YouTube video ${videoId} status to ${newStatus}...`);

      // For now, just update the local state since we don't have update functions for YouTube yet
      setYoutube(prevYoutube =>
        prevYoutube.map(video =>
          video.id === videoId ? { ...video, 'YouTube Status': newStatus } : video
        )
      );

      console.log(`YouTube video ${videoId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating YouTube status:', error);

      // Update the local state anyway to provide a good user experience
      setYoutube(prevYoutube =>
        prevYoutube.map(video =>
          video.id === videoId ? { ...video, 'YouTube Status': newStatus } : video
        )
      );

      // Show an error message to the user
      setError('Could not update YouTube status in Airtable. Changes are saved locally only.');
    }
  };

  // Handle Reddit status changes
  const handleRedditStatusChange = async (threadId: string, newStatus: RedditStatus) => {
    try {
      console.log(`Attempting to update Reddit thread ${threadId} status to ${newStatus}...`);

      // For now, just update the local state since we don't have update functions for Reddit yet
      setReddit(prevReddit =>
        prevReddit.map(thread =>
          thread.id === threadId ? { ...thread, 'Reddit Thread Status (General)': newStatus } : thread
        )
      );

      console.log(`Reddit thread ${threadId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating Reddit status:', error);

      // Update the local state anyway to provide a good user experience
      setReddit(prevReddit =>
        prevReddit.map(thread =>
          thread.id === threadId ? { ...thread, 'Reddit Thread Status (General)': newStatus } : thread
        )
      );

      // Show an error message to the user
      setError('Could not update Reddit status in Airtable. Changes are saved locally only.');
    }
  };

  // Make sure we don't display an error message for empty data sets
  useEffect(() => {
    // Clear any error message that contains empty data notifications
    if (error && (
        error.includes("No articles found") || 
        error.includes("No briefs found") ||
        error.includes("No YouTube data found") ||
        error.includes("No Reddit data found") ||
        error.includes("No youtube found") ||
        error.includes("No reddit found")
      )) {
      setError(null);
    }
  }, [error, selectedMonth]);

  // Modify the error notification to not display for empty data conditions
  const getModifiedError = () => {
    if (!error) return null;
    
    // Don't show errors about empty data sets
    if (error.includes("No articles found") || 
        error.includes("No briefs found") ||
        error.includes("No YouTube data found") ||
        error.includes("No Reddit data found") ||
        error.includes("No youtube found") ||
        error.includes("No reddit found")) {
      return null;
    }
    
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-700 hover:text-red-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <DashboardLayout>

      {/* Mock Data Notification */}
      <MockDataNotification />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={documentModal.isOpen}
        onClose={closeDocumentViewer}
        documentUrl={documentModal.url}
        title={documentModal.title}
      />

      {/* Replace error display with filtered version */}
      {getModifiedError()}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-mediumGray" style={{ fontSize: '16px' }}>Loading content workflow data...</span>
        </div>
      ) : (
        <div className="relative">
          {/* Fixed header and tab navigation section */}
          <div className="fixed-header-container bg-white dark:bg-dark z-30" style={{ left: sidebarExpanded ? '256px' : '80px', right: '16px' }}>
            {/* Tab navigation with month selector */}
            <div
              ref={stickyTabRef}
              className="page-container-tabs border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-2">
                <div className="w-full md:w-auto">
                  <TabNavigation
                    tabs={[
                      { id: 'briefs', label: 'Briefs', icon: <FileText size={16} /> },
                      { id: 'articles', label: 'Articles', icon: <BookOpen size={16} /> },
                      { id: 'youtube', label: 'YT', icon: <Video size={16} /> },
                      { id: 'reddit', label: 'Reddit Threads', icon: <MessageSquare size={16} /> },
                    ]}
                    activeTab={mainTab}
                    onTabChange={(tab) => setMainTab(tab as MainTab)}
                    variant="primary"
                    containerClassName="flex flex-wrap w-full"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <RoundedMonthSelector
                    selectedMonth={selectedMonth}
                    onChange={setSelectedMonth}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spacer to push content below fixed header */}
          <div style={{ height: '120px' }} className="md:hidden"></div>
          <div style={{ height: '86px' }} className="hidden md:block"></div>

          {/* Scrollable content area */}
          <div className="page-container mb-6">
            {mainTab === 'briefs' && (
              <div>
                <div className="page-container-body overflow-hidden">
                  <div className="kanban-container">
                    <BriefBoard
                      briefs={filteredBriefs}
                      onStatusChange={handleBriefStatusChange}
                      selectedMonth={selectedMonth}
                      hideActions={true}
                      onViewDocument={openDocumentViewer}
                    />

                    {/* Mobile scroll indicator */}
                    <div className="md:hidden mt-4 text-center text-sm text-gray-500">
                      <span>← Swipe to see more columns →</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'articles' && (
              <div>
                <div className="page-container-body overflow-hidden">
                  <div className="kanban-container">
                    <ArticleBoard
                      articles={filteredArticles}
                      onStatusChange={handleArticleStatusChange}
                      selectedMonth={selectedMonth}
                      hideActions={true}
                      onViewDocument={openDocumentViewer}
                    />

                    {/* Mobile scroll indicator */}
                    <div className="md:hidden mt-4 text-center text-sm text-gray-500">
                      <span>← Swipe to see more columns →</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'youtube' && (
              <div>
                <div className="page-container-body overflow-hidden">
                  <div className="kanban-container">
                    <YouTubeBoard
                      videos={filteredYoutube}
                      onStatusChange={handleYouTubeStatusChange}
                      selectedMonth={selectedMonth}
                      hideActions={true}
                      onViewDocument={openDocumentViewer}
                    />

                    {/* Mobile scroll indicator */}
                    <div className="md:hidden mt-4 text-center text-sm text-gray-500">
                      <span>← Swipe to see more columns →</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'reddit' && (
              <div>
                <div className="page-container-body overflow-hidden">
                  <div className="kanban-container">
                    <RedditBoard
                      threads={filteredReddit}
                      onStatusChange={handleRedditStatusChange}
                      selectedMonth={selectedMonth}
                      hideActions={true}
                      onViewDocument={openDocumentViewer}
                    />

                    {/* Mobile scroll indicator */}
                    <div className="md:hidden mt-4 text-center text-sm text-gray-500">
                      <span>← Swipe to see more columns →</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

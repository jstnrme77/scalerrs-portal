'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { updateBriefStatus, updateArticleStatus } from '@/lib/client-api';
import { BriefBoard, ArticleBoard } from '@/components/kanban/KanbanBoard';
import { BriefStatus, ArticleStatus } from '@/types';
import DocumentViewerModal from '@/components/modals/DocumentViewerModal';
import useDocumentViewer from '@/hooks/useDocumentViewer';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { FileText, BookOpen } from 'lucide-react';
import { useClientData } from '@/context/ClientDataContext';
import RoundedMonthSelector from '@/components/ui/custom/RoundedMonthSelector';
import MockDataNotification from '@/components/ui/custom/MockDataNotification';
import '@/styles/kanban.css';

// Define types for tabs
type MainTab = 'briefs' | 'articles';

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
  const [filteredBriefs, setFilteredBriefs] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);

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

        // Clear any existing mock data flag to ensure we're using real data
        if (isBrowser) {
          localStorage.setItem('use-mock-data', 'false');
        }

        // Fetch each data type separately to better handle errors
        let briefsData = [];
        let articlesData = [];
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

          // Use a direct fetch to the Netlify function with a timeout
          let url = '/.netlify/functions/get-briefs';
          if (selectedMonth) {
            url += `?month=${encodeURIComponent(selectedMonth)}`;
          }

          console.log('Fetching briefs directly from:', url);

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

            // Convert client to JSON string if it's an array
            if (currentUser.Client) {
              const clientIds = Array.isArray(currentUser.Client)
                ? currentUser.Client
                : [currentUser.Client];
              headers['x-user-client'] = JSON.stringify(clientIds);
              console.log('Adding client header:', JSON.stringify(clientIds));
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

          // Check if the response indicates it's mock data
          if (data.isMockData) {
            console.warn('Received mock data from server:', data.error);
            errorMessages.push(`Briefs: ${data.error || 'Server returned mock data'}`);
            hasErrors = true;

            // Show a notification to the user that we're using mock data
            if (typeof window !== 'undefined') {
              // Set a flag in localStorage to indicate we're using mock data
              localStorage.setItem('using-mock-data', 'true');
              localStorage.setItem('mock-data-reason', data.error || 'No matching data found');
            }
          } else if (data.briefs && data.briefs.length === 0) {
            console.warn('No briefs found for the selected month:', selectedMonth);
            errorMessages.push(`No briefs found for ${selectedMonth}`);
            hasErrors = true;
          }

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

          // Set flag to use mock data
          if (typeof window !== 'undefined') {
            localStorage.setItem('use-mock-data', 'true');
            localStorage.setItem('api-error-timestamp', Date.now().toString());
          }

          errorMessages.push(`Briefs: ${briefsErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Try to fetch mock data
          try {
            console.log('Attempting to use mock data for briefs');
            const { mockBriefs } = await import('@/lib/mock-data');
            setBriefs(mockBriefs);
          } catch (mockErr) {
            console.error('Error loading mock data:', mockErr);
            setBriefs([]);
          }
        }

        try {
          console.log('Fetching articles from Airtable for month:', selectedMonth);

          // Create a controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Fetch articles timeout after 20 seconds');
            controller.abort();
          }, 20000);

          // Use a direct fetch to the Netlify function with a timeout
          let url = '/.netlify/functions/get-articles';
          if (selectedMonth) {
            url += `?month=${encodeURIComponent(selectedMonth)}`;
          }

          console.log('Fetching articles directly from:', url);

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
            if (currentUser.Client) {
              const clientIds = Array.isArray(currentUser.Client)
                ? currentUser.Client
                : [currentUser.Client];
              headers['x-user-client'] = JSON.stringify(clientIds);
              console.log('Adding client header:', JSON.stringify(clientIds));
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

          // Check if the response indicates it's mock data
          if (data.isMockData) {
            console.warn('Received mock data from server:', data.error);
            errorMessages.push(`Articles: ${data.error || 'Server returned mock data'}`);
            hasErrors = true;

            // Show a notification to the user that we're using mock data
            if (typeof window !== 'undefined') {
              // Set a flag in localStorage to indicate we're using mock data
              localStorage.setItem('using-mock-data', 'true');
              localStorage.setItem('mock-data-reason', data.error || 'No matching data found');
            }
          } else if (data.articles && data.articles.length === 0) {
            console.warn('No articles found for the selected month:', selectedMonth);
            errorMessages.push(`No articles found for ${selectedMonth}`);
            hasErrors = true;
          }

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

          // Set flag to use mock data
          if (typeof window !== 'undefined') {
            localStorage.setItem('use-mock-data', 'true');
            localStorage.setItem('api-error-timestamp', Date.now().toString());
          }

          errorMessages.push(`Articles: ${articlesErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Try to fetch mock data
          try {
            console.log('Attempting to use mock data for articles');
            const { mockArticles } = await import('@/lib/mock-data');
            setArticles(mockArticles);
          } catch (mockErr) {
            console.error('Error loading mock data:', mockErr);
            setArticles([]);
          }
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

        // Set flag to use mock data
        if (typeof window !== 'undefined') {
          localStorage.setItem('use-mock-data', 'true');
          localStorage.setItem('api-error-timestamp', Date.now().toString());
        }
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
  }, [selectedMonth, briefs, articles, clientId, filterDataByClient]);

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

      {error && (
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
      )}

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
              <div className="flex justify-between items-center w-full">
                <TabNavigation
                  tabs={[
                    { id: 'briefs', label: 'Briefs', icon: <FileText size={18} /> },
                    { id: 'articles', label: 'Articles', icon: <BookOpen size={18} /> },
                  ]}
                  activeTab={mainTab}
                  onTabChange={(tab) => setMainTab(tab as MainTab)}
                  variant="primary"
                  containerClassName="overflow-x-auto"
                />
                <RoundedMonthSelector
                  selectedMonth={selectedMonth}
                  onChange={setSelectedMonth}
                />
              </div>
            </div>
          </div>

          {/* Spacer to push content below fixed header */}
          <div style={{ height: '86px' }}></div>

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
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

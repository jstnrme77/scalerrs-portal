'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchBriefs, fetchArticles, fetchBacklinks, fetchURLPerformance, updateBriefStatus, updateArticleStatus } from '@/lib/client-api';
import { mockBriefs2025, mockArticles2025, mockBacklinks2025 } from '@/lib/mock-data';
import { BriefBoard, ArticleBoard } from '@/components/kanban/KanbanBoard';
import { BriefStatus, ArticleStatus } from '@/types';
import DocumentViewerModal from '@/components/modals/DocumentViewerModal';
import useDocumentViewer from '@/hooks/useDocumentViewer';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { FileText, BookOpen, Link2 } from 'lucide-react';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'backlinks';

export default function ContentWorkflowPage() {
  const [mainTab, setMainTab] = useState<MainTab>('briefs');
  const [selectedMonth, setSelectedMonth] = useState('January');

  // State for Airtable data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [urlPerformance, setUrlPerformance] = useState<any[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [filteredBacklinks, setFilteredBacklinks] = useState<any[]>([]);

  // Filter states for backlinks
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drFilter, setDrFilter] = useState<string>('all');

  // Sort states for backlinks table
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use the document viewer hook
  const { documentModal, openDocumentViewer, closeDocumentViewer } = useDocumentViewer();

  // Create a mapping of URL Performance record IDs to URL paths
  const urlPathMap = useMemo(() => {
    const map: Record<string, string> = {};
    urlPerformance.forEach(url => {
      if (url.id) {
        map[url.id] = url['URL Path'] || url.URLPath || '/';
      }
    });
    return map;
  }, [urlPerformance]);

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

        // Check if we should use mock data
        let useMockData = false;
        if (isBrowser) {
          useMockData = localStorage.getItem('use-mock-data') === 'true';
          if (useMockData) {
            console.log('Using mock data based on localStorage setting');
            // Import mock data
            const { mockBriefs, mockArticles, mockBacklinks } = await import('@/lib/mock-data');
            setBriefs(mockBriefs);
            setArticles(mockArticles);
            setBacklinks(mockBacklinks);
            setLoading(false);
            return;
          }
        }

        // Fetch each data type separately to better handle errors
        let briefsData = [];
        let articlesData = [];
        let backlinksData = [];
        let urlPerformanceData = [];
        let hasErrors = false;
        const errorMessages = [];

        try {
          console.log('Fetching briefs...');
          briefsData = await fetchBriefs();
          console.log('Briefs fetched successfully:', briefsData.length, 'records');
          logData(briefsData, 'Briefs');
          setBriefs(briefsData);
        } catch (briefsErr: any) {
          console.error('Error fetching briefs:', briefsErr);
          errorMessages.push(`Briefs: ${briefsErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Import mock briefs as fallback
          const { mockBriefs } = await import('@/lib/mock-data');
          setBriefs(mockBriefs);
          console.log('Using mock briefs data as fallback');
        }

        try {
          console.log('Fetching articles...');
          articlesData = await fetchArticles();
          console.log('Articles fetched successfully:', articlesData.length, 'records');
          logData(articlesData, 'Articles');
          setArticles(articlesData);
        } catch (articlesErr: any) {
          console.error('Error fetching articles:', articlesErr);
          errorMessages.push(`Articles: ${articlesErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Import mock articles as fallback
          const { mockArticles } = await import('@/lib/mock-data');
          setArticles(mockArticles);
          console.log('Using mock articles data as fallback');
        }

        try {
          console.log('Fetching backlinks...');
          backlinksData = await fetchBacklinks();
          console.log('Backlinks fetched successfully:', backlinksData.length, 'records');
          logData(backlinksData, 'Backlinks');
          setBacklinks(backlinksData);
        } catch (backlinksErr: any) {
          console.error('Error fetching backlinks:', backlinksErr);
          errorMessages.push(`Backlinks: ${backlinksErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Import mock backlinks as fallback
          const { mockBacklinks } = await import('@/lib/mock-data');
          setBacklinks(mockBacklinks);
          console.log('Using mock backlinks data as fallback');
        }

        try {
          console.log('Fetching URL performance data...');
          urlPerformanceData = await fetchURLPerformance();
          console.log('URL performance data fetched successfully:', urlPerformanceData.length, 'records');
          logData(urlPerformanceData, 'URL Performance');
          setUrlPerformance(urlPerformanceData);
        } catch (urlPerformanceErr: any) {
          console.error('Error fetching URL performance data:', urlPerformanceErr);
          errorMessages.push(`URL Performance: ${urlPerformanceErr.message || 'Unknown error'}`);
          hasErrors = true;

          // Import mock URL performance data as fallback
          const { mockURLPerformance } = await import('@/lib/mock-data');
          setUrlPerformance(mockURLPerformance);
          console.log('Using mock URL performance data as fallback');
        }

        // Set error message if any of the fetches failed
        if (hasErrors) {
          setError(`Some data could not be fetched: ${errorMessages.join('; ')}. Using sample data as fallback.`);
          // Set a flag in localStorage to use mock data for future requests
          if (isBrowser) {
            localStorage.setItem('use-mock-data', 'true');
          }
        }
      } catch (err: any) {
        console.error('Error in content workflow data fetching:', err);
        setError(`An error occurred while fetching content workflow data: ${err.message || 'Unknown error'}`);

        // Import all mock data as fallback
        try {
          const { mockBriefs, mockArticles, mockBacklinks } = await import('@/lib/mock-data');
          setBriefs(mockBriefs);
          setArticles(mockArticles);
          setBacklinks(mockBacklinks);
          console.log('Using all mock data as fallback due to error');

          // Set a flag in localStorage to use mock data for future requests
          if (isBrowser) {
            localStorage.setItem('use-mock-data', 'true');
          }
        } catch (mockErr) {
          console.error('Error importing mock data:', mockErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by selected month and other filters
  useEffect(() => {
    console.log('Filtering data for month:', selectedMonth);
    console.log('Current backlinks data:', backlinks);

    // Check if we're looking at 2025 data
    const is2025Data = selectedMonth.includes('2025');

    if (is2025Data) {
      // Use 2025 mockup data
      console.log('Using 2025 mockup data for', selectedMonth);

      // Filter briefs for 2025
      const filtered2025Briefs = mockBriefs2025.filter(brief => brief.Month === selectedMonth);
      setFilteredBriefs(filtered2025Briefs);
      console.log('Filtered 2025 briefs:', filtered2025Briefs.length);

      // Filter articles for 2025
      const filtered2025Articles = mockArticles2025.filter(article => article.Month === selectedMonth);
      setFilteredArticles(filtered2025Articles);
      console.log('Filtered 2025 articles:', filtered2025Articles.length);

      // Filter backlinks for 2025
      let filtered2025Backlinks = mockBacklinks2025.filter(backlink => backlink.Month === selectedMonth);

      // Apply additional filters to 2025 backlinks
      if (statusFilter !== 'all') {
        filtered2025Backlinks = filtered2025Backlinks.filter(backlink => backlink.Status === statusFilter);
      }

      if (drFilter !== 'all') {
        if (drFilter === '50+') {
          filtered2025Backlinks = filtered2025Backlinks.filter(backlink => backlink['Domain Authority/Rating'] >= 50);
        } else if (drFilter === '60+') {
          filtered2025Backlinks = filtered2025Backlinks.filter(backlink => backlink['Domain Authority/Rating'] >= 60);
        } else if (drFilter === '70+') {
          filtered2025Backlinks = filtered2025Backlinks.filter(backlink => backlink['Domain Authority/Rating'] >= 70);
        }
      }

      setFilteredBacklinks(filtered2025Backlinks);
      console.log('Filtered 2025 backlinks:', filtered2025Backlinks.length);

      return; // Exit early since we're using 2025 data
    }

    // Regular filtering for non-2025 data
    if (briefs.length > 0) {
      const filtered = briefs.filter(brief => brief.Month === selectedMonth);
      setFilteredBriefs(filtered);
      console.log('Filtered briefs:', filtered.length);
    }

    if (articles.length > 0) {
      const filtered = articles.filter(article => article.Month === selectedMonth);
      setFilteredArticles(filtered);
      console.log('Filtered articles:', filtered.length);
    }

    if (backlinks.length > 0) {
      console.log('Filtering backlinks for month:', selectedMonth);
      console.log('Total backlinks before filtering:', backlinks.length);

      // Start with month filter
      let filtered = backlinks.filter(backlink => {
        console.log('Backlink month:', backlink.Month, 'Selected month:', selectedMonth, 'Match:', backlink.Month === selectedMonth);
        return backlink.Month === selectedMonth;
      });

      console.log('Filtered backlinks after month filter:', filtered.length);

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filtered = filtered.filter(backlink => backlink.Status === statusFilter);
        console.log('Filtered backlinks after status filter:', filtered.length);
      }

      // Apply DR filter if not 'all'
      if (drFilter !== 'all') {
        if (drFilter === '50+') {
          filtered = filtered.filter(backlink => (backlink['Domain Authority/Rating'] || backlink.DomainRating || 0) >= 50);
        } else if (drFilter === '60+') {
          filtered = filtered.filter(backlink => (backlink['Domain Authority/Rating'] || backlink.DomainRating || 0) >= 60);
        } else if (drFilter === '70+') {
          filtered = filtered.filter(backlink => (backlink['Domain Authority/Rating'] || backlink.DomainRating || 0) >= 70);
        }
        console.log('Filtered backlinks after DR filter:', filtered.length);
      }

      console.log('Final filtered backlinks:', filtered);
      setFilteredBacklinks(filtered);
    }
  }, [selectedMonth, briefs, articles, backlinks, statusFilter, drFilter]);

  // Handle brief status changes
  const handleBriefStatusChange = async (briefId: string, newStatus: BriefStatus) => {
    try {
      console.log(`Attempting to update brief ${briefId} status to ${newStatus}...`);

      // Check if we should use mock data
      const isBrowser = typeof window !== 'undefined';
      const useMockData = isBrowser && localStorage.getItem('use-mock-data') === 'true';

      if (useMockData) {
        console.log('Using mock data for updating brief status');
        // Update the local state only
        setBriefs(prevBriefs =>
          prevBriefs.map(brief =>
            brief.id === briefId ? { ...brief, Status: newStatus } : brief
          )
        );

        console.log(`Brief ${briefId} status updated to ${newStatus} (mock data)`);
        return;
      }

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

      // Set a flag to use mock data for future requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('use-mock-data', 'true');
      }

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

      // Check if we should use mock data
      const isBrowser = typeof window !== 'undefined';
      const useMockData = isBrowser && localStorage.getItem('use-mock-data') === 'true';

      if (useMockData) {
        console.log('Using mock data for updating article status');
        // Update the local state only
        setArticles(prevArticles =>
          prevArticles.map(article =>
            article.id === articleId ? { ...article, Status: newStatus } : article
          )
        );

        console.log(`Article ${articleId} status updated to ${newStatus} (mock data)`);
        return;
      }

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

      // Set a flag to use mock data for future requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('use-mock-data', 'true');
      }

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

  // Handle sorting for backlinks table
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, set it as sort column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Function to sort backlinks data
  const getSortedBacklinks = (backlinks: any[]) => {
    if (!sortColumn) return backlinks;

    return [...backlinks].sort((a, b) => {
      let valueA, valueB;

      // Handle different column types
      switch (sortColumn) {
        case 'Domain':
          valueA = a['Source Domain'] || a.Domain || '';
          valueB = b['Source Domain'] || b.Domain || '';
          break;
        case 'DR':
          valueA = Number(a['Domain Authority/Rating'] || a.DomainRating || 0);
          valueB = Number(b['Domain Authority/Rating'] || b.DomainRating || 0);
          break;
        case 'LinkType':
          valueA = a['Link Type'] || a.LinkType || '';
          valueB = b['Link Type'] || b.LinkType || '';
          break;
        case 'Status':
          valueA = a.Status || '';
          valueB = b.Status || '';
          break;
        case 'WentLiveOn':
          valueA = a['Went Live On'] || a.WentLiveOn || '';
          valueB = b['Went Live On'] || b.WentLiveOn || '';
          break;
        case 'Month':
          valueA = a.Month || '';
          valueB = b.Month || '';
          break;
        case 'Notes':
          valueA = a.Notes || '';
          valueB = b.Notes || '';
          break;
        default:
          return 0;
      }

      // Compare values based on direction
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };



  return (
    <DashboardLayout
      topNavBarProps={{
        selectedMonth: selectedMonth,
        onMonthChange: setSelectedMonth
      }}
    >



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
        <div className="page-container mb-6">
          <div className="page-container-tabs">
            <div className="tab-navigation">
              <div className="flex justify-between items-center w-full">
                <div className="flex overflow-x-auto">
                  <TabNavigation
                    tabs={[
                      { id: 'briefs', label: 'Briefs', icon: <FileText size={18} /> },
                      { id: 'articles', label: 'Articles', icon: <BookOpen size={18} /> },
                      { id: 'backlinks', label: 'Backlinks', icon: <Link2 size={18} /> },
                    ]}
                    activeTab={mainTab}
                    onTabChange={setMainTab}
                    variant="primary"
                  />
                </div>

                {mainTab === 'backlinks' && (
                  <div className="flex gap-4 pr-4">
                    <div>
                      <label className="block text-sm font-medium text-mediumGray mb-1" style={{ fontSize: '16px' }}>Filter by Status</label>
                      <select
                        className="px-3 py-2 border border-lightGray rounded-md bg-white"
                        style={{ fontSize: '16px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="Live">Live</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mediumGray mb-1" style={{ fontSize: '16px' }}>Filter by DR</label>
                      <select
                        className="px-3 py-2 border border-lightGray rounded-md bg-white"
                        style={{ fontSize: '16px' }}
                        value={drFilter}
                        onChange={(e) => setDrFilter(e.target.value)}
                      >
                        <option value="all">All DR</option>
                        <option value="50+">DR 50+</option>
                        <option value="60+">DR 60+</option>
                        <option value="70+">DR 70+</option>
                      </select>
                    </div>
                    {(statusFilter !== 'all' || drFilter !== 'all') && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setStatusFilter('all');
                            setDrFilter('all');
                          }}
                          className="px-3 py-2 text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                          style={{ fontSize: '16px' }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            {mainTab === 'briefs' && (
              <div>
                <div className="page-container-body">
                  <div>

                    <BriefBoard
                      briefs={filteredBriefs}
                      onStatusChange={handleBriefStatusChange}
                      selectedMonth={selectedMonth}
                      hideActions={true}
                      onViewDocument={openDocumentViewer}
                    />
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'articles' && (
              <div>
                <div className="page-container-body">
                  <div>

                    <ArticleBoard
                      articles={filteredArticles}
                      onStatusChange={handleArticleStatusChange}
                      selectedMonth={selectedMonth}
                      hideActions={true}
                      onViewDocument={openDocumentViewer}
                    />
                  </div>
                </div>
              </div>
            )}
            {mainTab === 'backlinks' && (
              <div>
                <div className="page-container-body shadow-none">
                  <div>


                    {filteredBacklinks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white" style={{ tableLayout: 'fixed' }}>
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('Domain')}>
                                Domain
                                {sortColumn === 'Domain' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('DR')}>
                                DR
                                {sortColumn === 'DR' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('LinkType')}>
                                Link Type
                                {sortColumn === 'LinkType' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">
                                Target URL
                              </th>
                              <th className="px-4 py-3 text-center text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('Status')}>
                                Status
                                {sortColumn === 'Status' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('WentLiveOn')}>
                                Went Live On
                                {sortColumn === 'WentLiveOn' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('Month')}>
                                Month
                                {sortColumn === 'Month' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                              <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('Notes')}>
                                Notes
                                {sortColumn === 'Notes' && (
                                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getSortedBacklinks(filteredBacklinks).map((backlink) => (
                              <tr
                                key={backlink.id}
                                className="hover:bg-gray-50"
                                style={{ color: '#353233' }}
                              >
                                <td className="px-4 py-3 font-medium text-dark" style={{ fontSize: '16px' }}>
                                  {backlink['Source Domain'] || backlink.Domain || 'Unknown Domain'}
                                </td>
                                <td className="px-4 py-3" style={{ fontSize: '16px' }}>
                                  <span className="px-2 py-1 text-base font-medium bg-gray-100 rounded-full">
                                    {backlink['Domain Authority/Rating'] !== undefined ? backlink['Domain Authority/Rating'] : (backlink.DomainRating !== undefined ? backlink.DomainRating : 'N/A')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {backlink['Link Type'] || backlink.LinkType || 'Unknown Type'}
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {(() => {
                                    // Get the target URL from the appropriate field
                                    const targetUrl = backlink["Target URL"] || backlink.TargetPage || '/';

                                    // Handle array of record IDs (Airtable linked records)
                                    if (Array.isArray(targetUrl) && targetUrl.length > 0) {
                                      const recordId = targetUrl[0];

                                      // Look up the URL path from our URL Performance data
                                      if (urlPathMap[recordId]) {
                                        return urlPathMap[recordId];
                                      }

                                      // If we don't have a mapping, use a generic path
                                      return `/page-${recordId.substring(0, 5)}`;
                                    }

                                    // Handle single record ID
                                    if (typeof targetUrl === 'string' && targetUrl.startsWith('rec') && targetUrl.length === 17) {
                                      // Look up the URL path from our URL Performance data
                                      if (urlPathMap[targetUrl]) {
                                        return urlPathMap[targetUrl];
                                      }

                                      // If we don't have a mapping, use a generic path
                                      return `/page-${targetUrl.substring(0, 5)}`;
                                    }

                                    // Format and display the URL
                                    if (typeof targetUrl === 'string') {
                                      if (targetUrl.startsWith('http')) {
                                        return (
                                          <a
                                            href={targetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                          >
                                            {targetUrl.replace(/^https?:\/\/[^/]+\//, '/')}
                                          </a>
                                        );
                                      } else if (targetUrl.startsWith('/')) {
                                        return targetUrl;
                                      } else {
                                        return `/${targetUrl}`;
                                      }
                                    } else {
                                      // If it's not a string or array, return a default value
                                      return '/';
                                    }
                                  })()}
                                </td>
                                <td className="px-4 py-3 text-center" style={{ fontSize: '16px' }}>
                                  <span className={`px-2 py-1 inline-flex text-base leading-5 font-semibold rounded-[12px]
                                    ${backlink.Status === 'Live' ? 'status-badge-green' :
                                    backlink.Status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                    backlink.Status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {backlink.Status || 'Unknown Status'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {backlink['Went Live On'] ? new Date(backlink['Went Live On']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (backlink.WentLiveOn ? new Date(backlink.WentLiveOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—')}
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {backlink.Month || selectedMonth}
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {backlink.Notes || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center bg-white !rounded-none">
                        <p className="text-gray-500" style={{ fontSize: '16px' }}>No backlinks data available for {selectedMonth}</p>
                      </div>
                    )}


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

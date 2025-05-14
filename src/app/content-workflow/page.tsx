'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchBriefs, fetchArticles, fetchBacklinks, fetchURLPerformance, updateBriefStatus, updateArticleStatus } from '@/lib/client-api';
import { BriefBoard, ArticleBoard } from '@/components/kanban/KanbanBoard';
import { BriefStatus, ArticleStatus } from '@/types';
import DocumentViewerModal from '@/components/modals/DocumentViewerModal';
import useDocumentViewer from '@/hooks/useDocumentViewer';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { FileText, BookOpen, Link2 } from 'lucide-react';
import { useClientData } from '@/context/ClientDataContext';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'backlinks';

export default function ContentWorkflowPage() {
  const [mainTab, setMainTab] = useState<MainTab>('briefs');
  const [selectedMonth, setSelectedMonth] = useState('January');
  const { clientId, filterDataByClient } = useClientData();

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
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

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

        // Clear any existing mock data flag to ensure we're using real data
        if (isBrowser) {
          localStorage.setItem('use-mock-data', 'false');
        }

        // Fetch each data type separately to better handle errors
        let briefsData = [];
        let articlesData = [];
        let backlinksData = [];
        let urlPerformanceData = [];
        let hasErrors = false;
        const errorMessages = [];

        try {
          console.log('Fetching briefs from Airtable...');
          briefsData = await fetchBriefs();
          console.log('Briefs fetched successfully:', briefsData.length, 'records');
          logData(briefsData, 'Briefs');
          setBriefs(briefsData);
        } catch (briefsErr: any) {
          console.error('Error fetching briefs:', briefsErr);
          errorMessages.push(`Briefs: ${briefsErr.message || 'Unknown error'}`);
          hasErrors = true;
          setBriefs([]);
        }

        try {
          console.log('Fetching articles from Airtable...');
          articlesData = await fetchArticles();
          console.log('Articles fetched successfully:', articlesData.length, 'records');
          logData(articlesData, 'Articles');
          setArticles(articlesData);
        } catch (articlesErr: any) {
          console.error('Error fetching articles:', articlesErr);
          errorMessages.push(`Articles: ${articlesErr.message || 'Unknown error'}`);
          hasErrors = true;
          setArticles([]);
        }

        try {
          console.log('Fetching backlinks from Airtable...');
          backlinksData = await fetchBacklinks();
          console.log('Backlinks fetched successfully:', backlinksData.length, 'records');
          logData(backlinksData, 'Backlinks');
          setBacklinks(backlinksData);

          // Extract unique status values from backlinks data
          const statuses = new Set<string>();
          backlinksData.forEach(backlink => {
            if (backlink.Status && typeof backlink.Status === 'string') {
              statuses.add(backlink.Status);
            }
          });
          setUniqueStatuses(Array.from(statuses).sort());
        } catch (backlinksErr: any) {
          console.error('Error fetching backlinks:', backlinksErr);
          errorMessages.push(`Backlinks: ${backlinksErr.message || 'Unknown error'}`);
          hasErrors = true;
          setBacklinks([]);
        }

        try {
          console.log('Fetching URL performance data from Airtable...');
          urlPerformanceData = await fetchURLPerformance();
          console.log('URL performance data fetched successfully:', urlPerformanceData.length, 'records');
          logData(urlPerformanceData, 'URL Performance');
          setUrlPerformance(urlPerformanceData);
        } catch (urlPerformanceErr: any) {
          console.error('Error fetching URL performance data:', urlPerformanceErr);
          errorMessages.push(`URL Performance: ${urlPerformanceErr.message || 'Unknown error'}`);
          hasErrors = true;
          setUrlPerformance([]);
        }

        // Set error message if any of the fetches failed
        if (hasErrors) {
          setError(`Some data could not be fetched: ${errorMessages.join('; ')}. Please check your Airtable connection.`);
        }
      } catch (err: any) {
        console.error('Error in content workflow data fetching:', err);
        setError(`An error occurred while fetching content workflow data: ${err.message || 'Unknown error'}`);

        // Clear the data states
        setBriefs([]);
        setArticles([]);
        setBacklinks([]);
        setUrlPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by selected month, client, and other filters
  useEffect(() => {
    console.log('Filtering data for month:', selectedMonth);
    console.log('Filtering data for client:', clientId);
    console.log('Current briefs data length:', briefs.length);
    console.log('Current articles data length:', articles.length);
    console.log('Current backlinks data length:', backlinks.length);

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

      // Then filter by month - handle case where Month might be in different formats
      const filtered = clientFiltered.filter(brief => {
        console.log(`Brief ${brief.id} month: "${brief.Month}", selected month: "${selectedMonth}"`);

        // If no month data is available, include it by default
        if (!brief.Month) {
          console.log(`Brief ${brief.id} has no month data, including by default`);
          return true;
        }

        // Check for exact match first
        if (brief.Month === selectedMonth) {
          return true;
        }

        // Normalize both month strings for comparison
        // Make sure brief.Month is a string before calling toLowerCase()
        const briefMonthLower = typeof brief.Month === 'string' ? brief.Month.toLowerCase() : String(brief.Month).toLowerCase();
        const selectedMonthLower = typeof selectedMonth === 'string' ? selectedMonth.toLowerCase() : String(selectedMonth).toLowerCase();

        // Check if the normalized strings match
        if (briefMonthLower === selectedMonthLower) {
          return true;
        }

        // Convert brief.Month to string safely
        const briefMonthStr = typeof brief.Month === 'string' ? brief.Month : String(brief.Month);
        const selectedMonthStr = typeof selectedMonth === 'string' ? selectedMonth : String(selectedMonth);

        // If brief month doesn't have a year but selected month does, compare just the month part
        if (briefMonthStr && !briefMonthStr.includes(' ') && selectedMonthStr.includes(' ')) {
          const selectedMonthName = selectedMonthStr.split(' ')[0].toLowerCase();
          return briefMonthLower === selectedMonthName;
        }

        // If brief month has a year but selected month doesn't, compare just the month part
        if (briefMonthStr && briefMonthStr.includes(' ') && !selectedMonthStr.includes(' ')) {
          const briefMonthName = briefMonthStr.split(' ')[0].toLowerCase();
          return briefMonthName === selectedMonthLower;
        }

        // Check if the month parts match regardless of year
        if (briefMonthStr && selectedMonthStr) {
          const briefMonthParts = briefMonthStr.toLowerCase().split(' ');
          const selectedMonthParts = selectedMonthStr.toLowerCase().split(' ');

          // Compare the month names (first part)
          if (briefMonthParts[0] === selectedMonthParts[0]) {
            return true;
          }
        }

        return false;
      });

      setFilteredBriefs(filtered);
      console.log('Filtered briefs after month filter:', filtered.length);
    }

    // Filter articles by month and client
    if (articles.length > 0) {
      // First filter by client
      const clientFiltered = filterDataByClient(articles);
      console.log('Client filtered articles:', clientFiltered.length);

      // Then filter by month - handle case where Month might be in different formats
      const filtered = clientFiltered.filter(article => {
        console.log(`Article ${article.id} month: "${article.Month}", selected month: "${selectedMonth}"`);

        // If no month data is available, include it by default
        if (!article.Month) {
          console.log(`Article ${article.id} has no month data, including by default`);
          return true;
        }

        // Check for exact match first
        if (article.Month === selectedMonth) {
          return true;
        }

        // Normalize both month strings for comparison
        // Make sure article.Month is a string before calling toLowerCase()
        const articleMonthLower = typeof article.Month === 'string' ? article.Month.toLowerCase() : String(article.Month).toLowerCase();
        const selectedMonthLower = typeof selectedMonth === 'string' ? selectedMonth.toLowerCase() : String(selectedMonth).toLowerCase();

        // Check if the normalized strings match
        if (articleMonthLower === selectedMonthLower) {
          return true;
        }

        // Convert article.Month to string safely
        const articleMonthStr = typeof article.Month === 'string' ? article.Month : String(article.Month);
        const selectedMonthStr = typeof selectedMonth === 'string' ? selectedMonth : String(selectedMonth);

        // If article month doesn't have a year but selected month does, compare just the month part
        if (articleMonthStr && !articleMonthStr.includes(' ') && selectedMonthStr.includes(' ')) {
          const selectedMonthName = selectedMonthStr.split(' ')[0].toLowerCase();
          return articleMonthLower === selectedMonthName;
        }

        // If article month has a year but selected month doesn't, compare just the month part
        if (articleMonthStr && articleMonthStr.includes(' ') && !selectedMonthStr.includes(' ')) {
          const articleMonthName = articleMonthStr.split(' ')[0].toLowerCase();
          return articleMonthName === selectedMonthLower;
        }

        // Check if the month parts match regardless of year
        if (articleMonthStr && selectedMonthStr) {
          const articleMonthParts = articleMonthStr.toLowerCase().split(' ');
          const selectedMonthParts = selectedMonthStr.toLowerCase().split(' ');

          // Compare the month names (first part)
          if (articleMonthParts[0] === selectedMonthParts[0]) {
            return true;
          }
        }

        return false;
      });

      setFilteredArticles(filtered);
      console.log('Filtered articles after month filter:', filtered.length);
    }

    // Filter backlinks by month, client, and additional filters
    if (backlinks.length > 0) {
      console.log('Filtering backlinks for month:', selectedMonth);
      console.log('Total backlinks before filtering:', backlinks.length);

      // First filter by client
      const clientFiltered = filterDataByClient(backlinks);
      console.log('Client filtered backlinks:', clientFiltered.length);

      // Then filter by month - handle case where Month might be in different formats
      let filtered = clientFiltered.filter(backlink => {
        console.log(`Backlink ${backlink.id} month: "${backlink.Month}", selected month: "${selectedMonth}"`);

        // If no month data is available, include it by default
        if (!backlink.Month) {
          console.log(`Backlink ${backlink.id} has no month data, including by default`);
          return true;
        }

        // Check for exact match first
        if (backlink.Month === selectedMonth) {
          return true;
        }

        // Convert backlink.Month to string safely
        const backlinkMonthStr = typeof backlink.Month === 'string' ? backlink.Month : String(backlink.Month);
        const selectedMonthStr = typeof selectedMonth === 'string' ? selectedMonth : String(selectedMonth);

        // Parse month and year from both strings
        const parseMonthYear = (monthStr: string) => {
          const parts = monthStr.trim().split(/\s+/);
          let month = '';
          let year = '';

          // Handle different formats: "March 2024", "March", "2024 March", etc.
          if (parts.length === 1) {
            // Only one part - assume it's the month
            month = parts[0];
          } else if (parts.length >= 2) {
            // Two or more parts - find which is month and which is year
            for (const part of parts) {
              if (/^\d{4}$/.test(part)) {
                // This part is a 4-digit year
                year = part;
              } else {
                // Assume this part is the month
                month = month ? `${month} ${part}` : part;
              }
            }
          }

          return { month: month.toLowerCase(), year };
        };

        const backlinkParsed = parseMonthYear(backlinkMonthStr);
        const selectedParsed = parseMonthYear(selectedMonthStr);

        console.log(`Parsed backlink month: "${backlinkParsed.month}", year: "${backlinkParsed.year}"`);
        console.log(`Parsed selected month: "${selectedParsed.month}", year: "${selectedParsed.year}"`);

        // If both have years and they don't match, filter out
        if (backlinkParsed.year && selectedParsed.year && backlinkParsed.year !== selectedParsed.year) {
          return false;
        }

        // If months match, include it
        return backlinkParsed.month === selectedParsed.month;
      });

      console.log('Filtered backlinks after month filter:', filtered.length);

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filtered = filtered.filter(backlink => {
          // Handle different status field names and formats
          const status = backlink.Status || '';

          // Check for exact match
          if (status === statusFilter) {
            return true;
          }

          // Handle special cases
          if (statusFilter === 'Link Live' && (status === 'Live' || status === 'Link Live')) {
            return true;
          }

          return false;
        });
        console.log('Filtered backlinks after status filter:', filtered.length);
      }

      // Apply DR filter if not 'all'
      if (drFilter !== 'all') {
        if (drFilter === '50+') {
          filtered = filtered.filter(backlink => {
            const dr = Number(backlink['DR ( API )'] || backlink['Domain Authority/Rating'] || backlink.DomainRating || 0);
            return dr >= 50;
          });
        } else if (drFilter === '60+') {
          filtered = filtered.filter(backlink => {
            const dr = Number(backlink['DR ( API )'] || backlink['Domain Authority/Rating'] || backlink.DomainRating || 0);
            return dr >= 60;
          });
        } else if (drFilter === '70+') {
          filtered = filtered.filter(backlink => {
            const dr = Number(backlink['DR ( API )'] || backlink['Domain Authority/Rating'] || backlink.DomainRating || 0);
            return dr >= 70;
          });
        }
        console.log('Filtered backlinks after DR filter:', filtered.length);
      }

      console.log('Final filtered backlinks:', filtered);
      setFilteredBacklinks(filtered);
    }
  }, [selectedMonth, briefs, articles, backlinks, statusFilter, drFilter, clientId, filterDataByClient]);

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
          valueA = a['Domain URL'] || a['Source Domain'] || a.Domain || '';
          valueB = b['Domain URL'] || b['Source Domain'] || b.Domain || '';
          break;
        case 'DR':
          valueA = Number(a['DR ( API )'] || a['Domain Authority/Rating'] || a.DomainRating || 0);
          valueB = Number(b['DR ( API )'] || b['Domain Authority/Rating'] || b.DomainRating || 0);
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
                    onTabChange={(tab) => setMainTab(tab as MainTab)}
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
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                        {uniqueStatuses.length === 0 && (
                          <>
                            <option value="Link Live">Link Live</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Rejected">Rejected</option>
                          </>
                        )}
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
                                  {backlink['Domain URL'] || backlink['Source Domain'] || backlink.Domain || 'Unknown Domain'}
                                </td>
                                <td className="px-4 py-3" style={{ fontSize: '16px' }}>
                                  <span className="px-2 py-1 text-base font-medium bg-gray-100 rounded-full">
                                    {backlink['DR ( API )'] !== undefined ? backlink['DR ( API )'] :
                                     (backlink['Domain Authority/Rating'] !== undefined ? backlink['Domain Authority/Rating'] :
                                      (backlink.DomainRating !== undefined ? backlink.DomainRating : 'N/A'))}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {backlink['Link Type'] || backlink.LinkType || 'Unknown Type'}
                                </td>
                                <td className="px-4 py-3 text-mediumGray" style={{ fontSize: '16px' }}>
                                  {(() => {
                                    // Get the target URL from the appropriate field
                                    const targetUrl = backlink['Client Target Page URL'] || backlink['Target URL'] || backlink.TargetPage || '/';

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
                                    ${backlink.Status === 'Live' || backlink.Status === 'Link Live' ? 'status-badge-green' :
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

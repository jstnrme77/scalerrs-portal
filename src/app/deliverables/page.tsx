'use client';
import { useState, useEffect, useMemo } from 'react';
import MonthSelector from '@/components/ui/selectors/MonthSelector';
import { fetchBriefs, fetchArticles, fetchBacklinks, fetchURLPerformance, updateBriefStatus, updateArticleStatus } from '@/lib/client-api';
import { BriefBoard, ArticleBoard } from '@/components/kanban/KanbanBoard';
import { BriefStatus, ArticleStatus } from '@/types';

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
    if (briefs.length > 0) {
      const filtered = briefs.filter(brief => brief.Month === selectedMonth);
      setFilteredBriefs(filtered);
    }

    if (articles.length > 0) {
      const filtered = articles.filter(article => article.Month === selectedMonth);
      setFilteredArticles(filtered);
    }

    if (backlinks.length > 0) {
      // Start with month filter
      let filtered = backlinks.filter(backlink => backlink.Month === selectedMonth);

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filtered = filtered.filter(backlink => backlink.Status === statusFilter);
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
      }

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

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-dark mr-4">Content Workflow</h1>
          {/* <button
            onClick={() => {
              console.log('Debug info:');
              console.log('Current briefs:', briefs);
              console.log('Filtered briefs:', filteredBriefs);
              console.log('Selected month:', selectedMonth);
              if (briefs.length > 0) {
                console.log('First brief:', briefs[0]);
                console.log('First brief fields:', Object.keys(briefs[0]));
              }
            }}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
          >
            Debug
          </button> */}
        </div>
        <div className="relative">
          <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
        </div>
      </div>

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
          <span className="ml-3 text-mediumGray">Loading content workflow data...</span>
        </div>
      ) : (
        <div className="page-container mb-6">
          <div className="page-container-tabs">
            <div className="tab-navigation">
              <div className="flex overflow-x-auto">
                <button
                  className={`tab-item ${mainTab === 'briefs' ? 'tab-item-active' : 'tab-item-inactive'} font-semibold`}
                  onClick={() => setMainTab('briefs')}
                >
                  Briefs
                </button>
                <button
                  className={`tab-item ${mainTab === 'articles' ? 'tab-item-active' : 'tab-item-inactive'} font-semibold`}
                  onClick={() => setMainTab('articles')}
                >
                  Articles
                </button>
                <button
                  className={`tab-item ${mainTab === 'backlinks' ? 'tab-item-active' : 'tab-item-inactive'} font-semibold`}
                  onClick={() => setMainTab('backlinks')}
                >
                  Backlinks
                </button>
              </div>
            </div>
          </div>
          <div>
            {mainTab === 'briefs' && (
              <div>
                <div className="page-container-body">
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center bg-purple-100 p-2 rounded-md mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#6B21A8">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <p className="text-sm font-medium">
                            {filteredBriefs.filter(brief => brief.Status === 'Review Brief').length} briefs need your review
                          </p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          {selectedMonth}: {filteredBriefs.filter(brief => brief.Status === 'Brief Approved').length} of {filteredBriefs.length} briefs approved
                          ({filteredBriefs.length > 0 ? Math.round((filteredBriefs.filter(brief => brief.Status === 'Brief Approved').length / filteredBriefs.length) * 100) : 0}%)
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${filteredBriefs.length > 0 ? Math.round((filteredBriefs.filter(brief => brief.Status === 'Brief Approved').length / filteredBriefs.length) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <BriefBoard
                      briefs={filteredBriefs}
                      onStatusChange={handleBriefStatusChange}
                      selectedMonth={selectedMonth}
                    />
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'articles' && (
              <div>
                <div className="page-container-body">
                  <div>
                    <div className="mb-4">
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          {selectedMonth}: {filteredArticles.filter(article => article.Status === 'Live').length} of {filteredArticles.length} articles delivered
                          ({filteredArticles.length > 0 ? Math.round((filteredArticles.filter(article => article.Status === 'Live').length / filteredArticles.length) * 100) : 0}%)
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${filteredArticles.length > 0 ? Math.round((filteredArticles.filter(article => article.Status === 'Live').length / filteredArticles.length) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <ArticleBoard
                      articles={filteredArticles}
                      onStatusChange={handleArticleStatusChange}
                      selectedMonth={selectedMonth}
                    />
                  </div>
                </div>
              </div>
            )}
            {mainTab === 'backlinks' && (
              <div>
                <div className="page-container-body">
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedMonth}: {filteredBacklinks.filter(b => b.Status === 'Live').length} links live ({filteredBacklinks.length > 0 ? Math.round((filteredBacklinks.filter(b => b.Status === 'Live').length / filteredBacklinks.length) * 100) : 0}%)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${filteredBacklinks.length > 0 ? Math.round((filteredBacklinks.filter(b => b.Status === 'Live').length / filteredBacklinks.length) * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {filteredBacklinks.length > 0 ? (
                      <div className="bg-white rounded-md">
                        <div className="border-b border-lightGray">
                          <div className="grid grid-cols-8 text-xs font-medium text-mediumGray uppercase">
                            <div className="px-4 py-3">Domain</div>
                            <div className="px-4 py-3">DR</div>
                            <div className="px-4 py-3">Link Type</div>
                            <div className="px-4 py-3">Target Page</div>
                            <div className="px-4 py-3">Status</div>
                            <div className="px-4 py-3">Went Live On</div>
                            <div className="px-4 py-3">Month</div>
                            <div className="px-4 py-3">Notes</div>
                          </div>
                        </div>
                        <div>
                          {filteredBacklinks.map((backlink, index) => (
                            <div
                              key={backlink.id}
                              className={`grid grid-cols-8 text-sm hover:bg-lightGray ${index !== filteredBacklinks.length - 1 ? 'border-b border-lightGray' : ''}`}
                              style={{ color: '#353233' }}
                            >
                              <div className="px-4 py-4 font-medium text-dark">{backlink['Source Domain'] || backlink.Domain || 'Unknown Domain'}</div>
                              <div className="px-4 py-4">
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                  {backlink['Domain Authority/Rating'] !== undefined ? backlink['Domain Authority/Rating'] : (backlink.DomainRating !== undefined ? backlink.DomainRating : 'N/A')}
                                </span>
                              </div>
                              <div className="px-4 py-4 text-mediumGray">{backlink['Link Type'] || backlink.LinkType || 'Unknown Type'}</div>
                              <div className="px-4 py-4 text-mediumGray">
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
                              </div>
                              <div className="px-4 py-4">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${backlink.Status === 'Live' ? 'bg-green-100 text-green-800' :
                                  backlink.Status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                  backlink.Status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                  {backlink.Status || 'Unknown Status'}
                                </span>
                              </div>
                              <div className="px-4 py-4 text-mediumGray">
                                {backlink['Went Live On'] ? new Date(backlink['Went Live On']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (backlink.WentLiveOn ? new Date(backlink.WentLiveOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—')}
                              </div>
                              <div className="px-4 py-4 text-mediumGray">{backlink.Month || selectedMonth}</div>
                              <div className="px-4 py-4 text-mediumGray">{backlink.Notes || '—'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center bg-white rounded-lg border border-lightGray">
                        <p className="text-gray-500">No backlinks data available for {selectedMonth}</p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4">
                      <div>
                        <label className="block text-xs font-medium text-mediumGray mb-1">Filter by Status</label>
                        <select
                          className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
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
                        <label className="block text-xs font-medium text-mediumGray mb-1">Filter by DR</label>
                        <select
                          className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
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
                            className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

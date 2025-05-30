'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchBriefs, fetchArticles, fetchBacklinks } from '@/lib/client-api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, FileText, BookOpen, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureUrlProtocol, formatDate } from '@/utils/field-utils';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { useClientData } from '@/context/ClientDataContext';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'backlinks';

// Helper function to get the current month and year in the format "Month YYYY"
const getCurrentMonthYear = (): string => {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  return `${month} ${year}`;
};

export default function DeliverablePage() {
  const [mainTab, setMainTab] = useState<MainTab>('briefs');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthYear());
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { 
    clientId,
    availableClients, 
    filterDataByClient,
    refreshClientData 
  } = useClientData();

  // State for Airtable data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Record<string, string | null>>({});
  const [briefs, setBriefs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [urlPerformance, setUrlPerformance] = useState<any[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [filteredBacklinks, setFilteredBacklinks] = useState<any[]>([]);

  // Sorting states
  const [briefSort, setBriefSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [articleSort, setArticleSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [backlinkSort, setBacklinkSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter states
  const [briefStatusFilter, setBriefStatusFilter] = useState<string>('all');
  const [articleStatusFilter, setArticleStatusFilter] = useState<string>('all');
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
      
      // Log user fields specifically to debug
      if (type === 'Briefs') {
        console.log('SEO Strategist field:', data[0].SEOStrategist || data[0]['SEO Strategist']);
        console.log('SEO Strategist type:', typeof(data[0].SEOStrategist || data[0]['SEO Strategist']));
        if (typeof(data[0].SEOStrategist || data[0]['SEO Strategist']) === 'object') {
          console.log('SEO Strategist keys:', Object.keys(data[0].SEOStrategist || data[0]['SEO Strategist'] || {}));
        }
      }
      
      if (type === 'Articles') {
        console.log('Writer field:', data[0].Writer || data[0]['Content Writer']);
        console.log('Writer type:', typeof(data[0].Writer || data[0]['Content Writer']));
        if (typeof(data[0].Writer || data[0]['Content Writer']) === 'object') {
          console.log('Writer keys:', Object.keys(data[0].Writer || data[0]['Content Writer'] || {}));
        }
        
        // Log URL fields
        console.log('Article URL field:', data[0].ArticleURL || data[0]['Article URL']);
        console.log('Target Page URL field:', data[0]['Target Page URL'] || data[0]['Target URL']);
        console.log('URL fields:', Object.keys(data[0]).filter(key => key.toLowerCase().includes('url')));
      }
      
      if (type === 'Backlinks') {
        console.log('Portal Status field:', data[0]['Portal Status']);
        console.log('Status field:', data[0].Status);
        console.log('Domain Rating field:', data[0]['DR ( API )'] || data[0].DomainRating || data[0]['Domain Authority/Rating']);
        
        // Log status fields
        console.log('Status fields:', Object.keys(data[0]).filter(key => key.toLowerCase().includes('status')));
      }
    } else {
      console.log(`No ${type} data available`);
    }
  };

  // Use effect to update layout with month selector
  useEffect(() => {
    const layoutData = {
      pathname: '/deliverables',
      selectedMonth: selectedMonth,
      onMonthChange: setSelectedMonth
    };

    // Dispatch event to communicate with layout
    window.dispatchEvent(new CustomEvent('updateTopNavBar', { detail: layoutData }));
  }, [selectedMonth]);

  // Add a separate effect to initialize the TopNavBar on component mount
  useEffect(() => {
    const layoutData = {
      pathname: '/deliverables',
      selectedMonth: selectedMonth,
      onMonthChange: setSelectedMonth
    };

    // Immediately dispatch event on mount to initialize TopNavBar
    window.dispatchEvent(new CustomEvent('updateTopNavBar', { detail: layoutData }));

    // Also set a timeout to dispatch the event again after a slight delay
    // This helps in case of race conditions with layout component mounting
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('updateTopNavBar', { detail: layoutData }));
    }, 100);
  }, []);

  // Make fetchData available outside the useEffect
  const fetchData = async () => {
    try {
      setLoading(true);
      setError({}); // Clear previous errors

      console.log('Starting to fetch deliverables data...');
      console.log('Selected month:', selectedMonth);
      console.log('Selected client:', clientId);

      // Check if client data is available, if not refresh it
      if (availableClients.length === 0) {
        console.log('No client data available, refreshing client data...');
        try {
          await refreshClientData();
        } catch (clientError) {
          console.error('Error refreshing client data:', clientError);
          // Don't fail the entire operation if client refresh fails
        }
      }

      // Get current user from localStorage
      const currentUser = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;
      
      console.log('Current user from localStorage:', currentUser ? 
        `${currentUser.Name} (${currentUser.Role})` : 'Not logged in');

      // Fetch each data type separately to better handle errors
      let briefsData = [];
      let articlesData = [];
      let backlinksData = [];
      let hasError = false;

      try {
        console.log('Fetching briefs...');
        briefsData = await fetchBriefs(selectedMonth);
        console.log(`Fetched ${briefsData.length} briefs`);
        logData(briefsData, 'Briefs');
      } catch (briefsError) {
        console.error('Error fetching briefs:', briefsError);
        setError(prev => ({ ...prev, briefs: 'Failed to load briefs data' }));
        hasError = true;
      }

      try {
        console.log('Fetching articles...');
        articlesData = await fetchArticles(selectedMonth);
        console.log(`Fetched ${articlesData.length} articles`);
        logData(articlesData, 'Articles');
      } catch (articlesError) {
        console.error('Error fetching articles:', articlesError);
        setError(prev => ({ ...prev, articles: 'Failed to load articles data' }));
        hasError = true;
      }

      try {
        console.log('Fetching backlinks...');
        backlinksData = await fetchBacklinks(selectedMonth);
        console.log(`Fetched ${backlinksData.length} backlinks`);
        logData(backlinksData, 'Backlinks');
      } catch (backlinksError) {
        console.error('Error fetching backlinks:', backlinksError);
        setError(prev => ({ ...prev, backlinks: 'Failed to load backlinks data' }));
        hasError = true;
      }

      // Only set general error if all three data types failed
      if (hasError && briefsData.length === 0 && articlesData.length === 0 && backlinksData.length === 0) {
        setError(prev => ({ ...prev, general: 'Failed to load deliverables data' }));
      } else if (!hasError) {
        // Clear any existing errors if the fetch was successful
        setError({});
      }

      // Apply client filtering here instead of in the useEffect
      // This ensures we're always working with the most recent data
      setBriefs(briefsData || []);
      setArticles(articlesData || []);
      setBacklinks(backlinksData || []);

      // Directly apply filtering here
      if (briefsData.length > 0) {
        const clientFiltered = filterDataByClient(briefsData);
        setFilteredBriefs(applyBriefFilters(clientFiltered));
      }

      if (articlesData.length > 0) {
        const clientFiltered = filterDataByClient(articlesData);
        setFilteredArticles(applyArticleFilters(clientFiltered));
      }

      if (backlinksData.length > 0) {
        const clientFiltered = filterDataByClient(backlinksData);
        setFilteredBacklinks(applyBacklinkFilters(clientFiltered));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(prev => ({ ...prev, general: 'Failed to load data' }));
    } finally {
      setLoading(false);
      // Record the time of this refresh
      localStorage.setItem('deliverables-last-refresh', Date.now().toString());
    }
  };

  // Helper functions to apply filters to each data type
  const applyBriefFilters = (data: any[]) => {
    let filtered = data;

    // Apply month filter
    if (selectedMonth) {
      filtered = filtered.filter(brief => {
        try {
          // Handle different month formats
          let briefMonth = brief.Month;
          
          // Handle case where Month is an object with a name property
          if (briefMonth && typeof briefMonth === 'object' && 'name' in briefMonth) {
            briefMonth = briefMonth.name;
          } else if (briefMonth && typeof briefMonth === 'object' && 'value' in briefMonth) {
            briefMonth = briefMonth.value;
          }
          
          // Convert to string for comparison
          const briefMonthStr = String(briefMonth || '');
          const selectedMonthName = selectedMonth.split(' ')[0]; // Get just the month name
          
          return briefMonthStr === selectedMonth || 
                briefMonthStr.startsWith(selectedMonthName);
        } catch (e) {
          console.error('Error filtering brief by month:', e, brief);
          return false;
        }
      });
    }

    // Apply status filter if not 'all'
    if (briefStatusFilter !== 'all') {
      filtered = filtered.filter(brief => {
        try {
          const status = String(brief.Status || '').toLowerCase();
          return status === briefStatusFilter.toLowerCase();
        } catch (e) {
          console.error('Error filtering brief by status:', e, brief);
          return false;
        }
      });
    }

    // Apply sorting
    filtered = sortItems(filtered, briefSort);
    
    return filtered;
  };

  const applyArticleFilters = (data: any[]) => {
    let filtered = data;

    // Apply month filter
    if (selectedMonth) {
      filtered = filtered.filter(article => {
        try {
          // Handle different month formats
          let articleMonth = article.Month;
          
          // Handle case where Month is an object with a name property
          if (articleMonth && typeof articleMonth === 'object' && 'name' in articleMonth) {
            articleMonth = articleMonth.name;
          } else if (articleMonth && typeof articleMonth === 'object' && 'value' in articleMonth) {
            articleMonth = articleMonth.value;
          }
          
          // Convert to string for comparison
          const articleMonthStr = String(articleMonth || '');
          const selectedMonthName = selectedMonth.split(' ')[0]; // Get just the month name
          
          return articleMonthStr === selectedMonth || 
                articleMonthStr.startsWith(selectedMonthName);
        } catch (e) {
          console.error('Error filtering article by month:', e, article);
          return false;
        }
      });
    }

    // Apply status filter if not 'all'
    if (articleStatusFilter !== 'all') {
      filtered = filtered.filter(article => {
        try {
          const status = String(article.Status || '').toLowerCase();
          return status === articleStatusFilter.toLowerCase();
        } catch (e) {
          console.error('Error filtering article by status:', e, article);
          return false;
        }
      });
    }

    // Apply sorting
    filtered = sortItems(filtered, articleSort);
    
    return filtered;
  };

  const applyBacklinkFilters = (data: any[]) => {
    let filtered = data;

    // Apply month filter
    if (selectedMonth) {
      filtered = filtered.filter(backlink => {
        try {
          // Handle different month formats
          let backlinkMonth = backlink.Month;
          
          // Handle case where Month is an object with a name property
          if (backlinkMonth && typeof backlinkMonth === 'object' && 'name' in backlinkMonth) {
            backlinkMonth = backlinkMonth.name;
          } else if (backlinkMonth && typeof backlinkMonth === 'object' && 'value' in backlinkMonth) {
            backlinkMonth = backlinkMonth.value;
          }
          
          // Convert to string for comparison
          const backlinkMonthStr = String(backlinkMonth || '');
          const selectedMonthName = selectedMonth.split(' ')[0]; // Get just the month name
          
          return backlinkMonthStr === selectedMonth || 
                backlinkMonthStr.startsWith(selectedMonthName);
        } catch (e) {
          console.error('Error filtering backlink by month:', e, backlink);
          return false;
        }
      });
    }

    // Apply status filter if not 'all' - make it case insensitive
    if (statusFilter !== 'all') {
      filtered = filtered.filter(backlink => {
        try {
          const status = String(backlink['Portal Status'] || backlink.Status || '').toLowerCase();
          return status === statusFilter.toLowerCase();
        } catch (e) {
          console.error('Error filtering backlink by status:', e, backlink);
          return false;
        }
      });
    }

    // Apply DR filter if not 'all' - handle the "50+", "60+", "70+" format
    if (drFilter !== 'all') {
      const minRating = parseInt(drFilter, 10);
      console.log(`Applying DR filter with minimum rating: ${minRating}`);
      
      filtered = filtered.filter(backlink => {
        try {
          const dr = Number(backlink.DomainRating || backlink['Domain Authority/Rating'] || backlink['DR ( API )'] || 0);
          const passes = !isNaN(minRating) && dr >= minRating;
          return passes;
        } catch (e) {
          console.error('Error filtering backlink by DR:', e, backlink);
          return false;
        }
      });
    }

    // Apply sorting
    filtered = sortItems(filtered, backlinkSort);
    
    return filtered;
  };

  // Handle tab change
  const handleTabChange = (tab: MainTab) => {
    setMainTab(tab);
    
    // If we're switching tabs and data is stale (hasn't been refreshed in 5 minutes), refresh it
    const lastRefreshTime = parseInt(localStorage.getItem('deliverables-last-refresh') || '0');
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes
    
    if (Date.now() - lastRefreshTime > refreshThreshold) {
      console.log('Data is stale, refreshing on tab change...');
      fetchData();
      localStorage.setItem('deliverables-last-refresh', Date.now().toString());
    }
  };

  // Fetch data from Airtable
  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh every 5 minutes to prevent stale data issues
    const refreshInterval = setInterval(() => {
      console.log('Performing periodic data refresh...');
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [selectedMonth, clientId]);

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

  // Helper function for sorting
  const sortItems = (items: any[], sort: { column: string; direction: 'asc' | 'desc' } | null) => {
    if (!sort) return items;

    return [...items].sort((a, b) => {
      let aValue = a[sort.column];
      let bValue = b[sort.column];

      // Handle date fields
      if (sort.column === 'DueDate' || sort.column === 'Due Date' || sort.column === 'WentLiveOn' || sort.column === 'Went Live On') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle numeric fields
      if (sort.column === 'WordCount' || sort.column === 'Word Count' || sort.column === 'DomainRating' || sort.column === 'Domain Authority/Rating') {
        aValue = aValue ? Number(aValue) : 0;
        bValue = bValue ? Number(bValue) : 0;
      }

      if (aValue === bValue) return 0;

      const result = aValue < bValue ? -1 : 1;
      return sort.direction === 'asc' ? result : -result;
    });
  };

  // Helper function to extract user name from Airtable User object
  const getUserName = (userField: any): string => {
    if (!userField) return '-';
    
    // If it's a string already, return it
    if (typeof userField === 'string') return userField;
    
    // If it's an object with name property
    if (typeof userField === 'object' && !Array.isArray(userField)) {
      // Common user object properties
      if (userField.name) return userField.name;
      if (userField.Name) return userField.Name;
      if (userField.email) return userField.email;
      if (userField.Email) return userField.Email;
      
      // Airtable specific - collaborator field format
      if (userField.id && userField.email) return userField.email;
      if (userField.id && userField.name) return userField.name;
      
      // If there's a displayName property
      if (userField.displayName) return userField.displayName;
      
      // If there's a value property (sometimes Airtable returns {value: "Name", label: "Name"})
      if (userField.value) return userField.value;
      if (userField.label) return userField.label;
      
      // Last resort - return the ID if available
      if (userField.id) return `User ${userField.id}`;
      
      // If we can't extract anything useful, convert the object to a string
      try {
        return JSON.stringify(userField);
      } catch (e) {
        return 'Unknown User';
      }
    }
    
    // If it's an array (multiple users assigned)
    if (Array.isArray(userField)) {
      if (userField.length === 0) return '-';
      return userField.map(user => getUserName(user)).join(', ');
    }
    
    return String(userField);
  };

  // Filter and sort data
  useEffect(() => {
    console.log('Filtering data for month:', selectedMonth);
    console.log('Filtering data for client:', clientId);
    console.log('Current briefs data length:', briefs.length);
    console.log('Current articles data length:', articles.length);
    console.log('Current backlinks data length:', backlinks.length);
    
    // Log filter states
    console.log('Brief status filter:', briefStatusFilter);
    console.log('Article status filter:', articleStatusFilter);
    console.log('Backlink status filter:', statusFilter);
    console.log('DR filter:', drFilter);

    // Apply filters to each data type
    setFilteredBriefs(applyBriefFilters(filterDataByClient(briefs)));
    setFilteredArticles(applyArticleFilters(filterDataByClient(articles)));
    setFilteredBacklinks(applyBacklinkFilters(filterDataByClient(backlinks)));
    
  }, [briefs, articles, backlinks, selectedMonth, briefStatusFilter, articleStatusFilter, statusFilter, drFilter, briefSort, articleSort, backlinkSort, clientId, filterDataByClient]);

  // Note: Status change handlers have been removed as we're using table views instead of kanban boards
  // Status changes are not part of the deliverables page requirements

  return (
    <main className="flex flex-1 flex-col gap-6 p-3 md:gap-8 md:p-1">
      {/* Fixed header container for summary cards and error messages */}
      <div className="bg-white flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-1" style={{ position: 'fixed', top: '64px', left: sidebarExpanded ? '256px' : '80px', right: '16px', paddingTop: '48px', paddingBottom: '16px', paddingLeft: '48px', paddingRight: '16px' }}>
        {/* Top-Level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-full">
          {/* Briefs Approved Card - Purple Border for Briefs */}
          <div className="rounded-lg border-8 p-6 bg-purple-50 h-[104px] flex items-center shadow-sm border-purple-400">
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-lg font-bold mb-1 notification-text">
                {filteredBriefs.length > 0
                  ? Math.round((filteredBriefs.filter(brief => 
                      String(brief.Status || '').toLowerCase() === 'brief approved' || 
                      String(brief.Status || '').toLowerCase() === 'approved'
                    ).length / filteredBriefs.length) * 100)
                  : 0}%
              </span>
              <span className="text-base font-medium">
                Briefs Delivered
              </span>
              <span className="text-base text-mediumGray mt-1">
                {filteredBriefs.filter(brief => 
                  String(brief.Status || '').toLowerCase() === 'brief approved' || 
                  String(brief.Status || '').toLowerCase() === 'approved'
                ).length} of {filteredBriefs.length} briefs approved
              </span>
            </div>
          </div>

          {/* Articles Live Card - Yellow Border for Articles */}
          <div className="rounded-lg border-8 p-6 bg-yellow-50 h-[104px] flex items-center shadow-sm border-yellow-400">
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-lg font-bold mb-1 notification-text">
                {filteredArticles.length > 0
                  ? Math.round((filteredArticles.filter(article => 
                      String(article.Status || '').toLowerCase() === 'live'
                    ).length / filteredArticles.length) * 100)
                  : 0}%
              </span>
              <span className="text-base font-medium">
                Articles Live
              </span>
              <span className="text-base text-mediumGray mt-1">
                {filteredArticles.filter(article => 
                  String(article.Status || '').toLowerCase() === 'live'
                ).length} of {filteredArticles.length} articles live
              </span>
            </div>
          </div>

          {/* Backlinks Live Card - Pink Border for Backlinks */}
          <div className="rounded-lg border-8 p-6 bg-pink-50 h-[104px] flex items-center shadow-sm border-pink-400">
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-lg font-bold mb-1 notification-text">
                {filteredBacklinks.length > 0
                  ? Math.round((filteredBacklinks.filter(backlink => 
                      String(backlink['Portal Status'] || backlink.Status || '').toLowerCase() === 'live'
                    ).length / filteredBacklinks.length) * 100)
                  : 0}%
              </span>
              <span className="text-base font-medium">
                Backlinks Live
              </span>
              <span className="text-base text-mediumGray mt-1">
                {filteredBacklinks.filter(backlink => 
                  String(backlink['Portal Status'] || backlink.Status || '').toLowerCase() === 'live'
                ).length} of {filteredBacklinks.length} backlinks placed
              </span>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {Object.keys(error).length > 0 && (
          <div className="w-full mb-4 max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error.general || Object.values(error)[0] || 'An error occurred while fetching deliverables data.'}</span>
              </div>
              <button
                onClick={() => setError({})}
                className="text-red-700 hover:text-red-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation and Filters */}
        <div className="border-b border-gray-200 bg-white flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-1">
          <div className="flex justify-between items-center">
            <div className="tab-navigation">
              <div className="flex overflow-x-auto">
                <TabNavigation
                  tabs={[
                    { id: 'briefs', label: 'Briefs', icon: <FileText size={18} /> },
                    { id: 'articles', label: 'Articles', icon: <BookOpen size={18} /> },
                    { id: 'backlinks', label: 'Backlinks', icon: <Link2 size={18} /> }
                  ]}
                  activeTab={mainTab}
                  onTabChange={(tab) => handleTabChange(tab as MainTab)}
                  variant="primary"
                />
              </div>
            </div>

            {/* Status Filter - dynamically shows the appropriate filter based on active tab */}
            <div className="ml-auto flex items-center gap-2">
              {mainTab === 'briefs' && (
                <>
                  <select
                    className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                    value={briefStatusFilter}
                    onChange={(e) => setBriefStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Brief Approved">Approved</option>
                    <option value="Needs Input">Needs Input</option>
                    <option value="Review Brief">Review Brief</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                  {briefStatusFilter !== 'all' && (
                    <button
                      onClick={() => setBriefStatusFilter('all')}
                      className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}

              {mainTab === 'articles' && (
                <>
                  <select
                    className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                    value={articleStatusFilter}
                    onChange={(e) => setArticleStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Live">Live</option>
                    <option value="Draft Approved">Draft Approved</option>
                    <option value="Review Draft">Review Draft</option>
                    <option value="In Production">In Production</option>
                    <option value="To Be Published">To Be Published</option>
                  </select>
                  {articleStatusFilter !== 'all' && (
                    <button
                      onClick={() => setArticleStatusFilter('all')}
                      className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}

              {mainTab === 'backlinks' && (
                <>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="live">Live</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                    <select
                      className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                      value={drFilter}
                      onChange={(e) => setDrFilter(e.target.value)}
                    >
                      <option value="all">All DR</option>
                      <option value="30">DR 30+</option>
                      <option value="40">DR 40+</option>
                      <option value="50">DR 50+</option>
                      <option value="60">DR 60+</option>
                      <option value="70">DR 70+</option>
                      <option value="80">DR 80+</option>
                    </select>
                  </div>
                  {(statusFilter !== 'all' || drFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setDrFilter('all');
                      }}
                      className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push content below fixed header */}
      <div style={{ height: '200px' }}></div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-mediumGray">Loading deliverables data...</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          {mainTab === 'briefs' && (
            <div className="bg-white">
              <Table className="min-w-full divide-y divide-gray-200 bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBriefSort(prev => ({
                            column: 'Title',
                            direction: prev?.column === 'Title' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        BRIEF TITLE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBriefSort(prev => ({
                            column: 'SEOStrategist',
                            direction: prev?.column === 'SEOStrategist' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        SEO STRATEGIST
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBriefSort(prev => ({
                            column: 'DueDate',
                            direction: prev?.column === 'DueDate' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        DUE DATE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBriefSort(prev => ({
                            column: 'Status',
                            direction: prev?.column === 'Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        STATUS
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBriefSort(prev => ({
                            column: 'Month',
                            direction: prev?.column === 'Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        MONTH
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px]">GDOC LINK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {filteredBriefs.length > 0 ? (
                    filteredBriefs.map((brief) => (
                      <TableRow key={brief.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="px-4 py-4 text-base font-medium text-dark">{String(brief.Title || '')}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(getUserName(brief.SEOStrategist || brief['SEO Strategist']))}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-mediumGray">
                          {brief.DueDate ? new Date(brief.DueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-lg
                            ${brief.Status === 'Brief Approved' || brief.Status === 'Approved' ? 'bg-green-100 text-green-800' :
                            brief.Status === 'Needs Input' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {String(brief.Status === 'Brief Approved' ? 'Approved' : brief.Status || 'Unknown')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800">
                            {String(brief.Month || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {brief.DocumentLink ? (
                            <a
                              href={ensureUrlProtocol(String(brief.DocumentLink))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-primary hover:underline flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View
                            </a>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-4 py-4 text-center text-gray-500">
                        No briefs available for {selectedMonth}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {mainTab === 'articles' && (
            <div className="bg-white">
              <Table className="min-w-full divide-y divide-gray-200 bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setArticleSort(prev => ({
                            column: 'Title',
                            direction: prev?.column === 'Title' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        ARTICLE TITLE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setArticleSort(prev => ({
                            column: 'Writer',
                            direction: prev?.column === 'Writer' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        WRITER
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setArticleSort(prev => ({
                            column: 'WordCount',
                            direction: prev?.column === 'WordCount' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        WORD COUNT
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setArticleSort(prev => ({
                            column: 'DueDate',
                            direction: prev?.column === 'DueDate' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        DUE DATE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setArticleSort(prev => ({
                            column: 'Status',
                            direction: prev?.column === 'Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        STATUS
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setArticleSort(prev => ({
                            column: 'Month',
                            direction: prev?.column === 'Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        MONTH
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">GDOC LINK</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px]">ARTICLE URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <TableRow key={article.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="px-4 py-4 text-base font-medium text-dark">{String(article.Title || '')}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(getUserName(article.Writer || article['Content Writer']))}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(article.WordCount || article['Word Count'] || article['Final Word Count'] || '-')}</TableCell>
                        <TableCell className="px-4 py-4">
                          {article.DueDate || article['Due Date'] ?
                            new Date(article.DueDate || article['Due Date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '-'}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-lg
                            ${article.Status === 'Live' ? 'bg-green-100 text-green-800' :
                            article.Status === 'Draft Approved' ? 'bg-blue-200 text-blue-800' :
                            article.Status === 'Review Draft' ? 'bg-yellow-200 text-yellow-800' :
                            article.Status === 'In Production' ? 'bg-purple-200 text-purple-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {String(article.Status || 'Unknown')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800">
                            {String(article.Month || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {article.DocumentLink || article['Document Link'] ? (
                            <a
                              href={ensureUrlProtocol(String(article.DocumentLink || article['Document Link']))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-primary hover:underline flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {article.ArticleURL || article['Article URL'] || article['Target Page URL'] ? (
                            <a
                              href={ensureUrlProtocol(String(article.ArticleURL || article['Article URL'] || article['Target Page URL']))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-primary hover:underline flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View
                            </a>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-base text-gray-500">
                        No articles available for {selectedMonth}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {mainTab === 'backlinks' && (
            <div className="bg-white">
              <Table className="min-w-full divide-y divide-gray-200 bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Name',
                            direction: prev?.column === 'Name' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        NAME
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Link Type',
                            direction: prev?.column === 'Link Type' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        LINK TYPE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Status',
                            direction: prev?.column === 'Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        STATUS
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Went Live On',
                            direction: prev?.column === 'Went Live On' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        WENT LIVE ON
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Domain URL',
                            direction: prev?.column === 'Domain URL' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        DOMAIN URL
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'DR ( API )',
                            direction: prev?.column === 'DR ( API )' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 font-medium flex items-center justify-center"
                      >
                        DR
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider">TRAFFIC</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">Target URL</TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider">Traffic of Target URL</TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider">RDs OF Target URL</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">ANCHOR TEXT</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">CLIENT TARGET URL</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Target Page Type',
                            direction: prev?.column === 'Target Page Type' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        TARGET PAGE TYPE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setBacklinkSort(prev => ({
                            column: 'Month',
                            direction: prev?.column === 'Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        MONTH
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px]">NOTES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {filteredBacklinks.length > 0 ? (
                    filteredBacklinks.map((backlink) => (
                      <TableRow key={backlink.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="px-4 py-4 text-base font-medium text-dark">{String(backlink.Name || '-')}</TableCell>
                        <TableCell className="px-4 py-4">{String(backlink['Link Type'] || backlink.LinkType || 'Unknown Type')}</TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-lg
                            ${(String(backlink['Status'] || '').toLowerCase() === 'link live') ? 'bg-green-100 text-green-800' :
                            (String(backlink['Status'] || '').toLowerCase() === 'scheduled') ? 'bg-yellow-200 text-yellow-800' :
                            (String(backlink['Status'] || '').toLowerCase() === 'rejected') ? 'bg-red-200 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {String(backlink['Status'] || backlink['Portal Status'] || 'Unknown Status')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {backlink['Went Live On'] ? (
                            <span className="px-2 py-1 text-sm font-medium bg-purple-100 rounded-lg text-purple-800">
                              {formatDate(backlink['Went Live On'])}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-base font-medium text-dark">
                          <a 
                            href={ensureUrlProtocol(String(backlink['Domain URL'] || backlink.Domain || ''))} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            {String(backlink['Domain URL'] || backlink.Domain || 'Unknown Domain')}
                          </a>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <span className="px-2 py-1 text-sm font-medium bg-gray-100 rounded-lg">
                            {backlink['DR ( API )'] !== undefined ? String(backlink['DR ( API )']) : 
                             (backlink['Domain Authority/Rating'] !== undefined ? String(backlink['Domain Authority/Rating']) : 
                             (backlink.DomainRating !== undefined ? String(backlink.DomainRating) : 'N/A'))}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <span className="px-2 py-1 text-sm font-medium bg-blue-100 rounded-lg text-blue-800">
                            {String(backlink['Domain Traffic ( API )'] || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {backlink["Backlink Page URL"] ? (
                            <a
                              href={ensureUrlProtocol(String(backlink["Backlink Page URL"]))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {String(backlink["Backlink Page URL"])}
                            </a>
                          ) : (
                            <span className="text-gray-500">No URL</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <span className="px-2 py-1 text-sm font-medium bg-green-100 rounded-lg text-green-800">
                            {String(backlink['Backlink URL Page Traffic ( API )'] || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <span className="px-2 py-1 text-sm font-medium bg-orange-100 rounded-lg text-orange-800">
                            {String(backlink['N° RDs Of Referring Page ( API )'] || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {String(backlink['Anchor Text'] || backlink.AnchorText || '-')}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {backlink["Client Target Page URL"] ? (
                            <a
                              href={ensureUrlProtocol(String(backlink["Client Target Page URL"]))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {String(backlink["Client Target Page URL"])}
                            </a>
                          ) : (
                            <span className="text-gray-500">No URL</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="px-2 py-1 text-sm font-medium bg-indigo-100 rounded-lg text-indigo-800">
                            {String(backlink['Target Page Type'] || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800">
                            {String(backlink.Month || selectedMonth)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(backlink.Notes || '—')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-4 text-base text-gray-500">
                        No backlinks available for {selectedMonth}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}


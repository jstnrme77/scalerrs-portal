'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchBriefs, fetchArticles, fetchBacklinks } from '@/lib/client-api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, FileText, BookOpen, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureUrlProtocol } from '@/utils/field-utils';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { useClientData } from '@/context/ClientDataContext';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'backlinks';

export default function DeliverablePage() {
  const [mainTab, setMainTab] = useState<MainTab>('briefs');
  const [selectedMonth, setSelectedMonth] = useState<string>('January 2025');
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

  // Fetch data from Airtable
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Starting to fetch deliverables data...');
        console.log('Selected month:', selectedMonth);
        console.log('Selected client:', clientId);

        // Get current user from localStorage
        const currentUser = typeof window !== 'undefined' ? 
          JSON.parse(localStorage.getItem('scalerrs-user') || 'null') : null;
        
        console.log('Current user from localStorage:', currentUser ? 
          `${currentUser.Name} (${currentUser.Role})` : 'Not logged in');

        // Fetch each data type separately to better handle errors
        let briefsData = [];
        let articlesData = [];
        let backlinksData = [];
        let hasErrors = false;
        const errorMessages = [];

        try {
          console.log('Fetching briefs...');
          briefsData = await fetchBriefs(selectedMonth);
          console.log('Briefs fetched successfully:', briefsData.length, 'records');
          logData(briefsData, 'Briefs');
          setBriefs(briefsData);
        } catch (briefsErr: any) {
          console.error('Error fetching briefs:', briefsErr);
          errorMessages.push(`Briefs: ${briefsErr.message || 'Unknown error'}`);
          hasErrors = true;
        }

        try {
          console.log('Fetching articles...');
          articlesData = await fetchArticles(selectedMonth);
          console.log('Articles fetched successfully:', articlesData.length, 'records');
          logData(articlesData, 'Articles');
          setArticles(articlesData);
        } catch (articlesErr: any) {
          console.error('Error fetching articles:', articlesErr);
          errorMessages.push(`Articles: ${articlesErr.message || 'Unknown error'}`);
          hasErrors = true;
        }

        try {
          console.log('Fetching backlinks...');
          backlinksData = await fetchBacklinks(selectedMonth);
          console.log('Backlinks fetched successfully:', backlinksData.length, 'records');
          logData(backlinksData, 'Backlinks');
          setBacklinks(backlinksData);
        } catch (backlinksErr: any) {
          console.error('Error fetching backlinks:', backlinksErr);
          errorMessages.push(`Backlinks: ${backlinksErr.message || 'Unknown error'}`);
          hasErrors = true;
        }

        // URL Performance functionality has been removed
        console.log('URL Performance functionality has been removed');
        setUrlPerformance([]);

        // Set error message if any of the fetches failed
        if (hasErrors) {
          setError(`Some data could not be fetched: ${errorMessages.join('; ')}.`);
        }
      } catch (err: any) {
        console.error('Error in deliverables data fetching:', err);
        setError(`An error occurred while fetching deliverables data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

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

    // Filter and sort briefs
    if (briefs.length > 0) {
      console.log('All briefs before filtering:', briefs.map(b => ({ id: b.id, Month: b.Month, Title: b.Title })));
      
      // First filter by client
      const clientFiltered = filterDataByClient(briefs);
      console.log('Client filtered briefs:', clientFiltered.length);
      
      // Then filter by month
      let filtered = clientFiltered;
      if (selectedMonth) {
        filtered = filtered.filter(brief => {
          const briefMonth = String(brief.Month || '');
          return briefMonth === selectedMonth || 
                 (typeof briefMonth === 'string' && briefMonth.startsWith(selectedMonth.split(' ')[0])); // Match just month name
        });
      }
      
      console.log(`Filtering briefs for month: "${selectedMonth}"`, filtered.length);

      // Apply status filter if not 'all'
      if (briefStatusFilter !== 'all') {
        filtered = filtered.filter(brief => brief.Status === briefStatusFilter);
      }

      // Apply sorting
      filtered = sortItems(filtered, briefSort);

      setFilteredBriefs(filtered);
    }

    // Filter and sort articles
    if (articles.length > 0) {
      // First filter by client
      const clientFiltered = filterDataByClient(articles);
      console.log('Client filtered articles:', clientFiltered.length);
      
      // Then filter by month
      let filtered = clientFiltered;
      if (selectedMonth) {
        filtered = filtered.filter(article => {
          const articleMonth = String(article.Month || '');
          return articleMonth === selectedMonth || 
                 (typeof articleMonth === 'string' && articleMonth.startsWith(selectedMonth.split(' ')[0])); // Match just month name
        });
      }

      // Apply status filter if not 'all'
      if (articleStatusFilter !== 'all') {
        filtered = filtered.filter(article => article.Status === articleStatusFilter);
      }

      // Apply sorting
      filtered = sortItems(filtered, articleSort);

      setFilteredArticles(filtered);
    }

    // Filter and sort backlinks
    if (backlinks.length > 0) {
      // First filter by client
      const clientFiltered = filterDataByClient(backlinks);
      console.log('Client filtered backlinks:', clientFiltered.length);
      
      // Then filter by month
      let filtered = clientFiltered;
      if (selectedMonth) {
        filtered = filtered.filter(backlink => {
          const backlinkMonth = String(backlink.Month || '');
          return backlinkMonth === selectedMonth || 
                 (typeof backlinkMonth === 'string' && backlinkMonth.startsWith(selectedMonth.split(' ')[0])); // Match just month name
        });
      }

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filtered = filtered.filter(backlink => backlink.Status === statusFilter);
      }

      // Apply DR filter if not 'all'
      if (drFilter !== 'all') {
        const [min, max] = drFilter.split('-').map(Number);
        filtered = filtered.filter(backlink => {
          const dr = Number(backlink.DomainRating || backlink['Domain Authority/Rating'] || 0);
          return dr >= min && (max ? dr <= max : true);
        });
      }

      // Apply sorting
      filtered = sortItems(filtered, backlinkSort);

      setFilteredBacklinks(filtered);
    }
  }, [briefs, articles, backlinks, selectedMonth, briefStatusFilter, articleStatusFilter, statusFilter, drFilter, briefSort, articleSort, backlinkSort, clientId, filterDataByClient]);

  // Note: Status change handlers have been removed as we're using table views instead of kanban boards
  // Status changes are not part of the deliverables page requirements

  return (
    <main className="flex flex-1 flex-col gap-6 p-3 md:gap-8 md:p-1">
      {/* Top-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-full">
        {/* Briefs Approved Card - Purple Border for Briefs */}
        <div className="rounded-lg border-8 p-6 bg-purple-50 h-[104px] flex items-center shadow-sm border-purple-400">
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-lg font-bold mb-1 notification-text">
              {filteredBriefs.length > 0
                ? Math.round((filteredBriefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved').length / filteredBriefs.length) * 100)
                : 0}%
            </span>
            <span className="text-base font-medium">
              Briefs Approved
            </span>
            <span className="text-base text-mediumGray mt-1">
              {filteredBriefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved').length} of {filteredBriefs.length} briefs approved
            </span>
          </div>
        </div>

        {/* Articles Live Card - Blue Border for Articles */}
        <div className="rounded-lg border-8 p-6 bg-blue-50 h-[104px] flex items-center shadow-sm border-blue-400">
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-lg font-bold mb-1 notification-text">
              {filteredArticles.length > 0
                ? Math.round((filteredArticles.filter(article => article.Status === 'Live').length / filteredArticles.length) * 100)
                : 0}%
            </span>
            <span className="text-base font-medium">
              Articles Live
            </span>
            <span className="text-base text-mediumGray mt-1">
              {filteredArticles.filter(article => article.Status === 'Live').length} of {filteredArticles.length} articles live
            </span>
          </div>
        </div>

        {/* Backlinks Live Card - Green Border for Backlinks */}
        <div className="rounded-lg border-8 p-6 bg-green-50 h-[104px] flex items-center shadow-sm border-green-400">
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-lg font-bold mb-1 notification-text">
              {filteredBacklinks.length > 0
                ? Math.round((filteredBacklinks.filter(backlink => backlink.Status === 'Live').length / filteredBacklinks.length) * 100)
                : 0}%
            </span>
            <span className="text-base font-medium">
              Backlinks Live
            </span>
            <span className="text-base text-mediumGray mt-1">
              {filteredBacklinks.filter(backlink => backlink.Status === 'Live').length} of {filteredBacklinks.length} backlinks placed
            </span>
          </div>
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
          <span className="ml-3 text-mediumGray">Loading deliverables data...</span>
        </div>
      ) : (
        <div className="page-container mb-6">
          <div className="page-container-tabs">
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
                    onTabChange={(tab) => setMainTab(tab as MainTab)}
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
                        <option value="Live">Live</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
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
          <div>
            {mainTab === 'briefs' && (
              <div>
                <div className="page-container-body">
                  <div>
                    {/* <div className="mb-4">
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
                    </div> */}
                    {/* Briefs Table */}
                    <div className="bg-white">

                      <Table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%] rounded-bl-[12px]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[20%]">
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
                                ASSIGNED SEO STRATEGIST
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%] rounded-br-[12px]">GDOC LINK</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                          {filteredBriefs.length > 0 ? (
                            filteredBriefs.map((brief) => (
                              <TableRow key={brief.id} className="hover:bg-gray-50 cursor-pointer">
                                <TableCell className="px-4 py-4 text-base font-medium text-dark w-[25%]">{String(brief.Title || '')}</TableCell>
                                <TableCell className="px-4 py-4 text-base text-dark w-[20%]">{String(getUserName(brief.SEOStrategist || brief['SEO Strategist']))}</TableCell>
                                <TableCell className="px-4 py-4 text-base text-mediumGray w-[15%]">
                                  {brief.DueDate ? new Date(brief.DueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                </TableCell>
                                <TableCell className="px-4 py-4 w-[15%]">
                                  <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-lg
                                    ${brief.Status === 'Brief Approved' || brief.Status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    brief.Status === 'Needs Input' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {String(brief.Status === 'Brief Approved' ? 'Approved' : brief.Status || 'Unknown')}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-4 text-base text-dark w-[15%]">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {String(brief.Month || '-')}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-4 w-[10%]">
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
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'articles' && (
              <div>
                <div className="page-container-body">
                  <div>
                    {/* Articles Table */}
                    <div className="bg-white">

                      <Table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[20%] rounded-bl-[12px]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[12%]">
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
                                ASSIGNED WRITER
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[14%]">GDOC LINK</TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[14%] rounded-br-[12px]">ARTICLE URL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                          {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                              <TableRow key={article.id} className="hover:bg-gray-50 cursor-pointer">
                                <TableCell className="px-4 py-4 text-base font-medium text-dark w-[20%]">{String(article.Title || '')}</TableCell>
                                <TableCell className="px-4 py-4 text-base text-dark w-[12%]">{String(getUserName(article.Writer || article['Content Writer']))}</TableCell>
                                <TableCell className="px-4 py-4 text-base text-dark w-[10%]">{String(article.WordCount || article['Word Count'] || '-')}</TableCell>
                                <TableCell className="w-[10%]">
                                  {article.DueDate || article['Due Date'] ?
                                    new Date(article.DueDate || article['Due Date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : '-'}
                                </TableCell>
                                <TableCell className="w-[10%]">
                                  <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-lg
                                    ${article.Status === 'Live' ? 'bg-green-100 text-green-800' :
                                    article.Status === 'Draft Approved' ? 'bg-blue-200 text-blue-800' :
                                    article.Status === 'Review Draft' ? 'bg-yellow-200 text-yellow-800' :
                                    article.Status === 'In Production' ? 'bg-purple-200 text-purple-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {String(article.Status || 'Unknown')}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[10%]">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {String(article.Month || '-')}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[14%]">
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
                                <TableCell className="w-[14%]">
                                  {article.ArticleURL || article['Article URL'] ? (
                                    <a
                                      href={ensureUrlProtocol(String(article.ArticleURL || article['Article URL']))}
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
                  </div>
                </div>
              </div>
            )}
            {mainTab === 'backlinks' && (
              <div>
                <div className="page-container-body">
                  <div>
                    {/* Backlinks Table */}
                    <div className="bg-white">

                      <Table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%] rounded-bl-[12px]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'Domain',
                                    direction: prev?.column === 'Domain' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 text-base font-medium flex items-center"
                              >
                                DOMAIN
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[8%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'LinkType',
                                    direction: prev?.column === 'LinkType' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 text-base font-medium flex items-center"
                              >
                                LINK TYPE
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[6%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'DomainRating',
                                    direction: prev?.column === 'DomainRating' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center justify-center"
                              >
                                DR
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[8%]">TRAFFIC OF DR</TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[12%]">BACKLINK PAGE URL</TableHead>
                            <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[6%]">RDS OF BACKLINK PAGE</TableHead>
                            <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[8%]">TRAFFIC OF BACKLINK PAGE</TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%]">ANCHOR TEXT</TableHead>
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[8%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[8%]">
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
                            <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%] rounded-br-[12px]">NOTES</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                          {filteredBacklinks.length > 0 ? (
                            filteredBacklinks.map((backlink) => (
                              <TableRow key={backlink.id} className="hover:bg-gray-50 cursor-pointer">
                                <TableCell className="px-4 py-4 text-base font-medium text-dark w-[10%]">{String(backlink['Source Domain'] || backlink.Domain || 'Unknown Domain')}</TableCell>
                                <TableCell className="w-[8%]">{String(backlink['Link Type'] || backlink.LinkType || 'Unknown Type')}</TableCell>
                                <TableCell className="w-[6%] text-center">
                                  <span className="px-2 py-1 text-sm font-medium bg-gray-100 rounded-full">
                                    {backlink['Domain Authority/Rating'] !== undefined ? String(backlink['Domain Authority/Rating']) : (backlink.DomainRating !== undefined ? String(backlink.DomainRating) : 'N/A')}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[8%] text-center">
                                  <span className="px-2 py-1 text-sm font-medium bg-blue-100 rounded-full text-blue-800">
                                    {Math.floor(Math.random() * 50000) + 10000}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[12%]">
                                  {backlink["Target URL"] || backlink.TargetPage ? (
                                    <a
                                      href={ensureUrlProtocol(String(backlink["Target URL"] || backlink.TargetPage))}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {String(backlink["Target URL"] || backlink.TargetPage)}
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">No URL</span>
                                  )}
                                </TableCell>
                                <TableCell className="w-[6%] text-center">
                                  <span className="px-2 py-1 text-sm font-medium bg-orange-100 rounded-full text-orange-800">
                                    {Math.floor(Math.random() * 500) + 50}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[8%] text-center">
                                  <span className="px-2 py-1 text-sm font-medium bg-green-100 rounded-full text-green-800">
                                    {Math.floor(Math.random() * 25000) + 5000}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[10%]">
                                  {String(backlink.AnchorText || backlink['Anchor Text'] || 'SEO best practices')}
                                </TableCell>
                                <TableCell className="w-[8%] pl-4">
                                  <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-lg
                                    ${backlink.Status === 'Live' ? 'bg-green-100 text-green-800' :
                                    backlink.Status === 'Scheduled' ? 'bg-yellow-200 text-yellow-800' :
                                    backlink.Status === 'Rejected' ? 'bg-red-200 text-red-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {String(backlink.Status || 'Unknown Status')}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-4 text-base text-dark w-[8%]">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {String(backlink.Month || selectedMonth)}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-4 text-base text-dark w-[10%]">{String(backlink.Notes || '—')}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={11} className="text-center py-4 text-base text-gray-500">
                                No backlinks available for {selectedMonth}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
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

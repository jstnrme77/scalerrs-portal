'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchBriefs, fetchArticles, fetchBacklinks, fetchURLPerformance } from '@/lib/client-api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockBriefs, mockArticles, mockBacklinks } from '@/lib/mock-data';
import mockData2025 from '@/mockups/content-workflow-2025';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'backlinks';

export default function DeliverablePage() {
  const [mainTab, setMainTab] = useState<MainTab>('briefs');
  const [selectedMonth, setSelectedMonth] = useState<string>('January 2025');

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

  // Immediately set mock data on component mount
  useEffect(() => {
    // Combine regular mock data with 2025 data
    const combinedBriefs = [
      ...mockBriefs.map(brief => ({
        ...brief,
        Month: brief.Month.includes(' ') ? brief.Month : `${brief.Month} 2024` // Add year if missing
      })),
      ...mockData2025.briefs
    ];
    
    const combinedArticles = [
      ...mockArticles.map(article => ({
        ...article,
        Month: article.Month.includes(' ') ? article.Month : `${article.Month} 2024` // Add year if missing
      })),
      ...mockData2025.articles
    ];
    
    const combinedBacklinks = [
      ...mockBacklinks.map(backlink => ({
        ...backlink,
        Month: backlink.Month.includes(' ') ? backlink.Month : `${backlink.Month} 2024` // Add year if missing
      })),
      ...mockData2025.backlinks
    ];
    
    // Set combined data
    console.log('Using combined mock data for deliverables page');
    setBriefs(combinedBriefs);
    setArticles(combinedArticles);
    setBacklinks(combinedBacklinks);
    
    // Also import URL Performance mock data
    const fetchURLMockData = async () => {
      const { mockURLPerformance } = await import('@/lib/mock-data');
      setUrlPerformance(mockURLPerformance);
      setLoading(false);
    };
    
    fetchURLMockData();
  }, []);

  // Fetch data from Airtable - no longer used but kept for reference
  const fetchRealData = async () => {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';

    try {
      setLoading(true);
      setError(null);

      console.log('Starting to fetch content workflow data...');

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
      }

      // Set error message if any of the fetches failed
      if (hasErrors) {
        setError(`Some data could not be fetched: ${errorMessages.join('; ')}. Using sample data as fallback.`);
      }
    } catch (err: any) {
      console.error('Error in content workflow data fetching:', err);
      setError(`An error occurred while fetching content workflow data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter and sort data
  useEffect(() => {
    // Filter and sort briefs
    if (briefs.length > 0) {
      console.log('All briefs before filtering:', briefs.map(b => ({ id: b.id, Month: b.Month, Title: b.Title })));
      // Start with month filter
      let filtered = briefs.filter(brief => brief.Month === selectedMonth);
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
      // Start with month filter
      let filtered = articles.filter(article => article.Month === selectedMonth);
      console.log(`Filtering articles for month: ${selectedMonth}`, filtered.length);

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
      // Start with month filter
      let filtered = backlinks.filter(backlink => backlink.Month === selectedMonth);
      console.log(`Filtering backlinks for month: ${selectedMonth}`, filtered.length);

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

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filtered = filtered.filter(backlink => backlink.Status === statusFilter);
      }

      // Apply sorting
      filtered = sortItems(filtered, backlinkSort);

      setFilteredBacklinks(filtered);
    }
  }, [
    selectedMonth,
    briefs, articles, backlinks,
    briefStatusFilter, articleStatusFilter, statusFilter, drFilter,
    briefSort, articleSort, backlinkSort
  ]);

  // Note: Status change handlers have been removed as we're using table views instead of kanban boards
  // Status changes are not part of the deliverables page requirements

  return (
    <main className="flex flex-1 flex-col gap-6 p-3 md:gap-8 md:p-1">
      {/* Top-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Briefs Approved Card */}
        <div className={`rounded-[16px] border-5 p-6 bg-white ${
          filteredBriefs.length > 0 &&
          (filteredBriefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved').length / filteredBriefs.length) >= 0.7
            ? 'border-[#9ea8fb]'
            : (filteredBriefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved').length / filteredBriefs.length) >= 0.5
              ? 'border-[#fcdc94]'
              : 'border-[#eadcff]'
        }`}>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold mb-2">
              {filteredBriefs.length > 0
                ? Math.round((filteredBriefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved').length / filteredBriefs.length) * 100)
                : 0}%
            </span>
            <span className="text-base font-medium">
              Briefs Approved
            </span>
            <span className="text-sm text-gray-600 mt-1">
              {filteredBriefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved').length} of {filteredBriefs.length} briefs approved
            </span>
          </div>
        </div>

        {/* Articles Live Card */}
        <div className={`rounded-[16px] border-5 p-6 bg-white ${
          filteredArticles.length > 0 &&
          (filteredArticles.filter(article => article.Status === 'Live').length / filteredArticles.length) >= 0.7
            ? 'border-[#9ea8fb]'
            : (filteredArticles.filter(article => article.Status === 'Live').length / filteredArticles.length) >= 0.5
              ? 'border-[#fcdc94]'
              : 'border-[#eadcff]'
        }`}>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold mb-2">
              {filteredArticles.length > 0
                ? Math.round((filteredArticles.filter(article => article.Status === 'Live').length / filteredArticles.length) * 100)
                : 0}%
            </span>
            <span className="text-base font-medium">
              Articles Live
            </span>
            <span className="text-sm text-gray-600 mt-1">
              {filteredArticles.filter(article => article.Status === 'Live').length} of {filteredArticles.length} articles live
            </span>
          </div>
        </div>

        {/* Backlinks Live Card */}
        <div className={`rounded-[16px] border-5 p-6 bg-white ${
          filteredBacklinks.length > 0 &&
          (filteredBacklinks.filter(backlink => backlink.Status === 'Live').length / filteredBacklinks.length) >= 0.7
            ? 'border-[#9ea8fb]'
            : (filteredBacklinks.filter(backlink => backlink.Status === 'Live').length / filteredBacklinks.length) >= 0.5
              ? 'border-[#fcdc94]'
              : 'border-[#eadcff]'
        }`}>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold mb-2">
              {filteredBacklinks.length > 0
                ? Math.round((filteredBacklinks.filter(backlink => backlink.Status === 'Live').length / filteredBacklinks.length) * 100)
                : 0}%
            </span>
            <span className="text-base font-medium">
              Backlinks Live
            </span>
            <span className="text-sm text-gray-600 mt-1">
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
                      <div className="mb-8 flex flex-wrap gap-4 p-4">
                        <div>
                          <select
                            className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                            value={briefStatusFilter}
                            onChange={(e) => setBriefStatusFilter(e.target.value)}
                          >
                            <option value="all">All Statuses</option>
                            <option value="Brief Approved">Approved</option>
                            <option value="Approved">Approved</option>
                            <option value="Needs Input">Needs Input</option>
                            <option value="Review Brief">Review Brief</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        </div>
                        {briefStatusFilter !== 'all' && (
                          <div className="flex items-end">
                            <button
                              onClick={() => setBriefStatusFilter('all')}
                              className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                            >
                              Clear Filter
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <Table>
                        <TableHeader className="bg-[#9EA8FB]/10">
                          <TableRow>
                            <TableHead className="font-semibold w-[25%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBriefSort(prev => ({
                                    column: 'Title',
                                    direction: prev?.column === 'Title' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Brief Title
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[20%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBriefSort(prev => ({
                                    column: 'SEOStrategist',
                                    direction: prev?.column === 'SEOStrategist' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Assigned SEO Strategist
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[15%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBriefSort(prev => ({
                                    column: 'DueDate',
                                    direction: prev?.column === 'DueDate' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Due Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[15%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBriefSort(prev => ({
                                    column: 'Status',
                                    direction: prev?.column === 'Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Status
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[15%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBriefSort(prev => ({
                                    column: 'Month',
                                    direction: prev?.column === 'Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Month
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[10%]">GDoc Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBriefs.length > 0 ? (
                            filteredBriefs.map((brief) => (
                              <TableRow key={brief.id}>
                                <TableCell className="font-medium w-[25%]">{brief.Title}</TableCell>
                                <TableCell className="w-[20%]">{brief.SEOStrategist || brief['SEO Strategist'] || '-'}</TableCell>
                                <TableCell className="w-[15%]">
                                  {brief.DueDate ? new Date(brief.DueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                </TableCell>
                                <TableCell className="w-[15%]">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                                    ${brief.Status === 'Brief Approved' || brief.Status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    brief.Status === 'Needs Input' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {brief.Status === 'Brief Approved' ? 'Approved' : brief.Status}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[15%]">{brief.Month || '-'}</TableCell>
                                <TableCell className="w-[10%]">
                                  {brief.DocumentLink ? (
                                    <a
                                      href={brief.DocumentLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center"
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
                              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
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
                    {/* <div className="mb-4">
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
                    </div> */}
                    {/* Articles Table */}
                    <div className="bg-white">
                      <div className="mb-8 flex flex-wrap gap-4 p-4">
                        <div>
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
                        </div>
                        {articleStatusFilter !== 'all' && (
                          <div className="flex items-end">
                            <button
                              onClick={() => setArticleStatusFilter('all')}
                              className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                            >
                              Clear Filter
                            </button>
                          </div>
                        )}
                      </div>

                      <Table>
                        <TableHeader className="bg-[#9EA8FB]/10">
                          <TableRow>
                            <TableHead className="font-semibold w-[20%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setArticleSort(prev => ({
                                    column: 'Title',
                                    direction: prev?.column === 'Title' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Article Title
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[12%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setArticleSort(prev => ({
                                    column: 'Writer',
                                    direction: prev?.column === 'Writer' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Assigned Writer
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[10%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setArticleSort(prev => ({
                                    column: 'WordCount',
                                    direction: prev?.column === 'WordCount' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Word Count
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[10%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setArticleSort(prev => ({
                                    column: 'DueDate',
                                    direction: prev?.column === 'DueDate' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Due Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[10%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setArticleSort(prev => ({
                                    column: 'Status',
                                    direction: prev?.column === 'Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Status
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[10%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setArticleSort(prev => ({
                                    column: 'Month',
                                    direction: prev?.column === 'Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Month
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[14%]">GDoc Link</TableHead>
                            <TableHead className="font-semibold w-[14%]">Article URL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                              <TableRow key={article.id}>
                                <TableCell className="font-medium w-[20%]">{article.Title}</TableCell>
                                <TableCell className="w-[12%]">{article.Writer || article['Content Writer'] || '-'}</TableCell>
                                <TableCell className="w-[10%]">{article.WordCount || article['Word Count'] || '-'}</TableCell>
                                <TableCell className="w-[10%]">
                                  {article.DueDate || article['Due Date'] ?
                                    new Date(article.DueDate || article['Due Date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : '-'}
                                </TableCell>
                                <TableCell className="w-[10%]">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                                    ${article.Status === 'Live' ? 'bg-green-100 text-green-800' :
                                    article.Status === 'Draft Approved' ? 'bg-blue-200 text-blue-800' :
                                    article.Status === 'Review Draft' ? 'bg-yellow-200 text-yellow-800' :
                                    article.Status === 'In Production' ? 'bg-purple-200 text-purple-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {article.Status}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[10%]">{article.Month || '-'}</TableCell>
                                <TableCell className="w-[14%]">
                                  {article.DocumentLink || article['Document Link'] ? (
                                    <a
                                      href={article.DocumentLink || article['Document Link']}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center"
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
                                      href={article.ArticleURL || article['Article URL']}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center"
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
                              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
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
                    {/* <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedMonth}: {filteredBacklinks.filter(b => b.Status === 'Live').length} links live ({filteredBacklinks.length > 0 ? Math.round((filteredBacklinks.filter(b => b.Status === 'Live').length / filteredBacklinks.length) * 100) : 0}%)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${filteredBacklinks.length > 0 ? Math.round((filteredBacklinks.filter(b => b.Status === 'Live').length / filteredBacklinks.length) * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div> */}

                    {/* Backlinks Table */}
                    <div className="bg-white">
                      <div className="mb-8 flex flex-wrap gap-4 p-4">
                        <div>
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

                      <Table>
                        <TableHeader className="bg-[#9EA8FB]/10">
                          <TableRow>
                            <TableHead className="font-semibold w-[18%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'Domain',
                                    direction: prev?.column === 'Domain' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Domain
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[8%] text-center">
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
                            <TableHead className="font-semibold w-[12%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'LinkType',
                                    direction: prev?.column === 'LinkType' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Link Type
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[15%]">Target Page</TableHead>
                            <TableHead className="font-semibold w-[12%] pl-4">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'Status',
                                    direction: prev?.column === 'Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Status
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[12%] pl-4">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'WentLiveOn',
                                    direction: prev?.column === 'WentLiveOn' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Went Live On
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[10%]">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setBacklinkSort(prev => ({
                                    column: 'Month',
                                    direction: prev?.column === 'Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                                  }));
                                }}
                                className="p-0 h-8 font-medium flex items-center"
                              >
                                Month
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            </TableHead>
                            <TableHead className="font-semibold w-[13%]">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBacklinks.length > 0 ? (
                            filteredBacklinks.map((backlink) => (
                              <TableRow key={backlink.id}>
                                <TableCell className="font-medium w-[18%]">{backlink['Source Domain'] || backlink.Domain || 'Unknown Domain'}</TableCell>
                                <TableCell className="w-[8%] text-center">
                                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                    {backlink['Domain Authority/Rating'] !== undefined ? backlink['Domain Authority/Rating'] : (backlink.DomainRating !== undefined ? backlink.DomainRating : 'N/A')}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[12%]">{backlink['Link Type'] || backlink.LinkType || 'Unknown Type'}</TableCell>
                                <TableCell className="w-[15%]">
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
                                </TableCell>
                                <TableCell className="w-[12%] pl-4">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                                    ${backlink.Status === 'Live' ? 'bg-green-100 text-green-800' :
                                    backlink.Status === 'Scheduled' ? 'bg-yellow-200 text-yellow-800' :
                                    backlink.Status === 'Rejected' ? 'bg-red-200 text-red-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {backlink.Status || 'Unknown Status'}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[12%] pl-4">
                                  {backlink['Went Live On'] ? new Date(backlink['Went Live On']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (backlink.WentLiveOn ? new Date(backlink.WentLiveOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—')}
                                </TableCell>
                                <TableCell className="w-[10%]">{backlink.Month || selectedMonth}</TableCell>
                                <TableCell className="w-[13%]">{backlink.Notes || '—'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
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

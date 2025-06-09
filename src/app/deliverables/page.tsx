'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchBriefs, fetchArticles, fetchBacklinks, fetchRedditThreads, fetchRedditComments, fetchYoutubeScriptsOnly } from '@/lib/client-api';
import { fetchYoutubeScripts } from '@/lib/youtube-api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TabNavigation from "@/components/ui/navigation/TabNavigation";
import { ArrowUpDown, BookOpen, CheckCheck, FileText, Link2, MessageCircle, Video } from "lucide-react";
import { ensureUrlProtocol, formatDate } from '@/utils/field-utils';
import { useClientData } from '@/context/ClientDataContext';
import React from 'react';

// Define types for tabs
type MainTab = 'briefs' | 'articles' | 'backlinks' | 'youtubescripts' | 'redditcomments';

// Define types for the data
interface RedditComment {
  id: string;
  Comment?: string;
  Status?: string;
  'Comment Text Proposition (Internal)': string;
  'Comment Text Proposition (External)': string;
  'Author Name (team pseudonym)': string;
  Votes?: string | number;
  'Current N° Of Upvotes'?: string | number;
  'Date Posted'?: string;
  'Publication Date'?: string;
  'Reddit Thread (Relation)': string[];
  'Reddit Thread Name'?: string;
  threadId?: string;
  threadTitle?: string;
  threadUrl?: string;
  isFirstInThread?: boolean;
  [key: string]: any;
}

// Define type for grouped Reddit comments
type GroupedRedditComments = Record<string, RedditComment[]>;

// Helper function to get the current month and year in the format "Month YYYY"
const getCurrentMonthYear = (): string => {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  return `${month} ${year}`;
};

// Helper function to extract linked record data following Airtable best practices
const getLinkedRecordValue = (
  linkedRecordField: any, 
  threadMap?: Map<string, any>, 
  targetProperty: string = 'name'
): { id: string, value: string } => {
  // If the field is null or undefined
  if (!linkedRecordField) {
    return { id: '', value: '' };
  }
  
  // If it's an array (standard Airtable linked record format)
  if (Array.isArray(linkedRecordField) && linkedRecordField.length > 0) {
    const firstRecord = linkedRecordField[0];
    
    // If it's a direct ID string (this is what we're getting in our case)
    if (typeof firstRecord === 'string') {
      const id = firstRecord;
      let value = '';
      
      // If a thread map is provided, try to get the title from there
      if (threadMap && threadMap.has(id)) {
        const thread = threadMap.get(id) || {};
        // Look for common title fields in the thread record
        value = (thread as any).Title || (thread as any).Name || (thread as any).Keyword || 
                (typeof (thread as any)['Reddit Thread URL'] === 'string' ? 
                 (thread as any)['Reddit Thread URL'].split('/').pop() : '');
      }
      
      return { id, value };
    }
    
    // If it's an object with id and name properties (standard Airtable linked record)
    if (typeof firstRecord === 'object' && firstRecord !== null) {
      const id = 'id' in firstRecord ? firstRecord.id : '';
      const value = targetProperty in firstRecord ? firstRecord[targetProperty] : '';
      return { id, value };
    }
  }
  
  // If it's a direct string value
  if (typeof linkedRecordField === 'string') {
    return { id: linkedRecordField, value: '' };
  }
  
  // If it's a direct object
  if (typeof linkedRecordField === 'object' && linkedRecordField !== null && !Array.isArray(linkedRecordField)) {
    const id = 'id' in linkedRecordField ? linkedRecordField.id : '';
    const value = targetProperty in linkedRecordField ? linkedRecordField[targetProperty] : '';
    return { id, value };
  }
  
  // Default fallback
  return { id: '', value: '' };
};

// Helper function to normalize month names for comparison
const normalizeMonthName = (monthName: string): string => {
  const months: Record<string, string> = {
    'january': 'january',
    'jan': 'january',
    'february': 'february',
    'feb': 'february',
    'march': 'march',
    'mar': 'march',
    'april': 'april',
    'apr': 'april',
    'may': 'may',
    'june': 'june',
    'jun': 'june',
    'july': 'july',
    'jul': 'july',
    'august': 'august',
    'aug': 'august',
    'september': 'september',
    'sept': 'september',
    'sep': 'september',
    'october': 'october',
    'oct': 'october',
    'november': 'november',
    'nov': 'november',
    'december': 'december',
    'dec': 'december'
  };
  
  const lowercaseMonth = monthName.toLowerCase().trim();
  return months[lowercaseMonth] || lowercaseMonth;
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
  const [youtubeScripts, setYoutubeScripts] = useState<any[]>([]);
  const [redditComments, setRedditComments] = useState<RedditComment[]>([]);
  const [redditThreads, setRedditThreads] = useState<any[]>([]);
  const [urlPerformance, setUrlPerformance] = useState<any[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [filteredBacklinks, setFilteredBacklinks] = useState<any[]>([]);
  const [filteredYoutubeScripts, setFilteredYoutubeScripts] = useState<any[]>([]);
  const [filteredRedditComments, setFilteredRedditComments] = useState<GroupedRedditComments>({});

  // Sorting states
  const [briefSort, setBriefSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [articleSort, setArticleSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [backlinkSort, setBacklinkSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [youtubeScriptSort, setYoutubeScriptSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [redditCommentSort, setRedditCommentSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter states
  const [briefStatusFilter, setBriefStatusFilter] = useState<string>('all');
  const [articleStatusFilter, setArticleStatusFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [youtubeScriptStatusFilter, setYoutubeScriptStatusFilter] = useState<string>('all');
  const [redditCommentStatusFilter, setRedditCommentStatusFilter] = useState<string>('all');
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
      let briefsData: any[] = [];
      let articlesData: any[] = [];
      let backlinksData: any[] = [];
      let youtubeScriptsData: any[] = [];
      let redditCommentsData: any[] = [];
      let redditThreadsData: any[] = [];
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

      try {
        console.log('Fetching YouTube scripts...');
        // Fetch both regular YouTube data and YouTube scripts
        const [regularYoutubeData, youtubeScriptsOnlyData] = await Promise.all([
          fetchYoutubeScripts(selectedMonth),
          fetchYoutubeScriptsOnly()
        ]);
        
        console.log(`Fetched regular YouTube data: ${regularYoutubeData?.length || 0} items`);
        console.log(`Fetched YouTube scripts only data: ${youtubeScriptsOnlyData?.length || 0} items`);
        
        // Ensure we have arrays for both data types
        const regularData = Array.isArray(regularYoutubeData) ? regularYoutubeData : [];
        const scriptsData = Array.isArray(youtubeScriptsOnlyData) ? youtubeScriptsOnlyData : [];
        
        // Combine both data sources - use a Map to avoid duplicates
        const combinedMap = new Map();
        
        // First add all regular YouTube data
        regularData.forEach(video => {
          combinedMap.set(video.id, video);
        });
        
        // Then add or merge script-specific data
        scriptsData.forEach(script => {
          if (combinedMap.has(script.id)) {
            // Merge with existing record
            combinedMap.set(script.id, {
              ...combinedMap.get(script.id),
              ...script
            });
          } else {
            // Add new record
            combinedMap.set(script.id, script);
          }
        });
        
        // Convert map back to array
        youtubeScriptsData = Array.from(combinedMap.values());
        
        console.log(`Combined ${youtubeScriptsData.length} YouTube scripts after merging`);
        
        // Log data for debugging
        if (youtubeScriptsData.length > 0) {
          console.log('Sample YouTube script data after merging:', youtubeScriptsData[0]);
          console.log('All Target Month values:', youtubeScriptsData.map(item => item['Target Month']));
          console.log('All Script Status values:', youtubeScriptsData.map(item => item['Script Status']));
          
          // Check for June 2025 records
          const juneRecords = youtubeScriptsData.filter(item => {
            const month = item['Target Month'];
            return month && String(month).toLowerCase().includes('june 2025');
          });
          
          console.log(`Found ${juneRecords.length} records with June 2025 in Target Month`);
          if (juneRecords.length > 0) {
            console.log('June 2025 records:', juneRecords.map(item => ({
              id: item.id,
              keyword: item['Keyword Topic'],
              month: item['Target Month'],
              status: item['Script Status'] || item['Script Status for Deliverables']
            })));
          }
        }
        
        logData(youtubeScriptsData, 'YouTube Scripts');
      } catch (youtubeScriptsError) {
        console.error('Error fetching YouTube scripts:', youtubeScriptsError);
        setError(prev => ({ ...prev, youtubescripts: 'Failed to load YouTube scripts data' }));
        hasError = true;
      }

      try {
        console.log('Fetching Reddit comments and threads...');
        redditThreadsData = await fetchRedditThreads(selectedMonth);
        redditCommentsData = await fetchRedditComments();
        
        console.log(`Fetched ${redditCommentsData?.length || 0} Reddit comments`);
        console.log(`Fetched ${redditThreadsData?.length || 0} Reddit threads`);
        
        // Ensure we have arrays for both data types
        if (!Array.isArray(redditThreadsData)) {
          console.warn('Reddit threads data is not an array, initializing as empty array');
          redditThreadsData = [];
        }
        
        if (!Array.isArray(redditCommentsData)) {
          console.warn('Reddit comments data is not an array, initializing as empty array');
          redditCommentsData = [];
        }
        
        // Process Reddit comments to add threadId
        if (redditCommentsData.length > 0) {
          // Create a map of thread IDs to thread records
          const threadMap = new Map(redditThreadsData.map(thread => [thread.id, thread]));
          
          // Log sample data for debugging
          console.log('Sample thread map entries:', Array.from(threadMap.entries()).slice(0, 2));
          if (redditCommentsData.length > 0) {
            console.log('Sample comment fields:', redditCommentsData.slice(0, 2).map(comment => ({
              id: comment.id,
              threadRelation: comment['Reddit Thread (Relation)'] || null,
              threadField: comment['Reddit Thread'] || null,
              threadName: comment['Reddit Thread Name'] || null
            })));
          }
          
          // Check for actual thread relation format in first comment (if available)
          if (redditCommentsData.length > 0 && redditCommentsData[0]['Reddit Thread (Relation)']) {
            const sampleRelation = redditCommentsData[0]['Reddit Thread (Relation)'];
            console.log('Detailed sample thread relation analysis:', {
              isArray: Array.isArray(sampleRelation),
              length: Array.isArray(sampleRelation) ? sampleRelation.length : 'not an array',
              firstItem: Array.isArray(sampleRelation) && sampleRelation.length > 0 ? sampleRelation[0] : 'no items',
              firstItemType: Array.isArray(sampleRelation) && sampleRelation.length > 0 ? typeof sampleRelation[0] : 'N/A',
              firstItemKeys: Array.isArray(sampleRelation) && sampleRelation.length > 0 && 
                            typeof sampleRelation[0] === 'object' && sampleRelation[0] !== null ? 
                            Object.keys(sampleRelation[0]) : 'N/A'
            });
          }
          
          // Assign threadId and threadTitle to each comment based on Reddit Thread relation
          redditCommentsData = redditCommentsData.map(comment => {
            try {
              // Check for both field name variations - both can contain the linked record data
              const threadRelation = comment && (comment['Reddit Thread (Relation)'] || comment['Reddit Thread'] || []);
              
              // Use our helper function to extract the linked record information
              const { id: threadId, value: threadName } = getLinkedRecordValue(threadRelation, threadMap);
              
              // Check for dedicated thread name field first
              let threadTitle = comment && comment['Reddit Thread Name'] ? comment['Reddit Thread Name'] : threadName || '(Empty)';
              let threadUrl = '';
              
              console.log(`Comment ${comment?.id || 'unknown'} thread relation processed:`, {
                originalRelation: threadRelation,
                extractedId: threadId, 
                extractedName: threadName,
                dedicatedThreadName: comment?.['Reddit Thread Name'] || null
              });
              
              // If we didn't get a thread name, try to get it from the thread map
              if (!threadTitle || threadTitle === '(Empty)') {
                const thread = threadMap.get(threadId);
                if (thread) {
                  // Try different possible title fields in the thread record
                  threadTitle = thread.Title || thread.Name || thread.Keyword || 
                              (typeof thread['Reddit Thread URL'] === 'string' ? 
                               thread['Reddit Thread URL'].split('/').pop() : 'Thread #' + threadId.substring(0, 5));
                               
                  // Get the thread URL
                  threadUrl = thread['Reddit Thread URL'] || '';
                  
                  console.log(`Found thread for comment ${comment?.id || 'unknown'}:`, {
                    threadId,
                    threadTitle,
                    threadUrl
                  });
                } else {
                  console.log(`No thread found for comment ${comment?.id || 'unknown'} with threadId ${threadId}`);
                  // If the thread doesn't exist in our thread data, try to extract a name from the ID
                  if (threadTitle === '(Empty)') {
                    // Try to find a more descriptive title from the comment fields
                    const topic = comment?.['Topic'] || comment?.['Keyword'] || '';
                    if (topic && typeof topic === 'string' && topic.trim().length > 0) {
                      threadTitle = topic;
                    } else {
                      // Last resort - create a generic title without showing the ID
                      threadTitle = 'Reddit Discussion Thread';
                    }
                  }
                }
              }
              
              return {
                ...comment,
                threadId: threadId || 'unknown',
                threadTitle,
                threadUrl
              };
            } catch (commentError) {
              console.error(`Error processing comment ${comment?.id || 'unknown'}:`, commentError);
              // Return the comment with default thread values
              return {
                ...comment,
                threadId: 'unknown',
                threadTitle: 'Error Processing Thread',
                threadUrl: ''
              };
            }
          });
          
          // Create a grouping of comments by thread to check our mapping
          const groupCheck = redditCommentsData.reduce((acc: Record<string, number>, comment) => {
            const threadId = comment.threadId || 'unknown';
            acc[threadId] = (acc[threadId] || 0) + 1;
            return acc;
          }, {});
          
          console.log('Comments grouped by thread after processing:', groupCheck);
        }
        
        logData(redditCommentsData, 'Reddit Comments');
        logData(redditThreadsData, 'Reddit Threads');
      } catch (redditError) {
        console.error('Error fetching Reddit data:', redditError);
        setError(prev => ({ ...prev, redditcomments: 'Failed to load Reddit data' }));
        hasError = true;
      }

      // Only set general error if all data types failed
      if (hasError && briefsData.length === 0 && articlesData.length === 0 && backlinksData.length === 0 && 
          youtubeScriptsData.length === 0 && redditCommentsData.length === 0) {
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
      setYoutubeScripts(youtubeScriptsData || []);
      setRedditComments(redditCommentsData || []);
      setRedditThreads(redditThreadsData || []);

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

      if (youtubeScriptsData.length > 0) {
        const clientFiltered = filterDataByClient(youtubeScriptsData);
        setFilteredYoutubeScripts(applyYoutubeScriptFilters(clientFiltered));
      }
      
      if (redditCommentsData.length > 0) {
        const clientFiltered = filterDataByClient(redditCommentsData);
        setFilteredRedditComments(applyRedditCommentFilters(clientFiltered));
      }

      // Set flag in localStorage to track last refresh time
      localStorage.setItem('deliverables-last-refresh', Date.now().toString());
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(prev => ({ ...prev, general: 'Failed to load deliverables data' }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse CSV data
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
      if (!line.trim()) return null; // Skip empty lines
      
      const values = line.split(',').map(value => value.trim());
      const record: { [key: string]: string } = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      return record;
    }).filter((record): record is { [key: string]: string } => record !== null);
  };

  // Helper functions to apply filters to each data type
  const applyBriefFilters = (data: any[]) => {
    let filtered = data;

    // Apply month filter
    if (selectedMonth && data.length > 0) {
      // Parse the selected month to get standardized parts
      const selectedMonthParts = selectedMonth.toLowerCase().split(' ');
      const selectedMonthName = selectedMonthParts[0];
      const selectedYear = selectedMonthParts.length > 1 ? selectedMonthParts[1] : new Date().getFullYear().toString();
      
      console.log('Filtering briefs with month parts:', { selectedMonthName, selectedYear, selectedMonth });
      
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
          
          // Handle null or undefined month
          if (!briefMonth) {
            return false;
          }
          
          // Convert to string for comparison and make case-insensitive
          const briefMonthStr = String(briefMonth).toLowerCase();
          
          // 1. Exact match - this would be ideal
          if (briefMonthStr === selectedMonth.toLowerCase()) {
            console.log(`Exact match for brief "${brief.Title}": ${briefMonthStr} = ${selectedMonth.toLowerCase()}`);
            return true;
          }
          
          // 2. Parse the brief month to extract month name and year
          const briefMonthParts = briefMonthStr.split(' ');
          const briefMonthName = briefMonthParts[0];
          const briefYear = briefMonthParts.length > 1 ? briefMonthParts[1] : '';
          
          // 3. Match both month name and year - enforce year matching
          const monthNameMatches = briefMonthName === selectedMonthName || 
                                  briefMonthName.includes(selectedMonthName) || 
                                  selectedMonthName.includes(briefMonthName);
          const yearMatches = briefYear === selectedYear;
          
          // Log for debugging
          console.log('Brief month check:', { 
            title: brief.Title,
            briefMonth: briefMonthStr,
            briefMonthName,
            briefYear,
            selectedMonthName,
            selectedYear,
            monthNameMatches,
            yearMatches,
            passes: monthNameMatches && yearMatches
          });
          
          // Only return true if both month name AND year match
          return monthNameMatches && yearMatches;
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
    if (selectedMonth && data.length > 0) {
      // Parse the selected month to get standardized parts
      const selectedMonthParts = selectedMonth.toLowerCase().split(' ');
      const selectedMonthName = selectedMonthParts[0];
      const selectedYear = selectedMonthParts.length > 1 ? selectedMonthParts[1] : new Date().getFullYear().toString();
      
      console.log('Filtering articles with month parts:', { selectedMonthName, selectedYear, selectedMonth });
      
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
          
          // Handle null or undefined month
          if (!articleMonth) {
            return false;
          }
          
          // Convert to string for comparison and make case-insensitive
          const articleMonthStr = String(articleMonth).toLowerCase();
          
          // 1. Exact match - this would be ideal
          if (articleMonthStr === selectedMonth.toLowerCase()) {
            console.log(`Exact match for article "${article.Title}": ${articleMonthStr} = ${selectedMonth.toLowerCase()}`);
            return true;
          }
          
          // 2. Parse the article month to extract month name and year
          const articleMonthParts = articleMonthStr.split(' ');
          const articleMonthName = articleMonthParts[0];
          const articleYear = articleMonthParts.length > 1 ? articleMonthParts[1] : '';
          
          // 3. Match both month name and year - enforce year matching
          const monthNameMatches = articleMonthName === selectedMonthName || 
                                  articleMonthName.includes(selectedMonthName) || 
                                  selectedMonthName.includes(articleMonthName);
          const yearMatches = articleYear === selectedYear;
          
          // Log for debugging
          console.log('Article month check:', { 
            title: article.Title,
            articleMonth: articleMonthStr,
            articleMonthName,
            articleYear,
            selectedMonthName,
            selectedYear,
            monthNameMatches,
            yearMatches,
            passes: monthNameMatches && yearMatches
          });
          
          // Only return true if both month name AND year match
          return monthNameMatches && yearMatches;
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
    if (selectedMonth && data.length > 0) {
      // Parse the selected month to get standardized parts
      const selectedMonthParts = selectedMonth.toLowerCase().split(' ');
      const selectedMonthName = selectedMonthParts[0];
      const selectedYear = selectedMonthParts.length > 1 ? selectedMonthParts[1] : new Date().getFullYear().toString();
      
      console.log('Filtering backlinks with month parts:', { selectedMonthName, selectedYear, selectedMonth });
      
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
          
          // Handle null or undefined month
          if (!backlinkMonth) {
            return false;
          }
          
          // Convert to string for comparison and make case-insensitive
          const backlinkMonthStr = String(backlinkMonth).toLowerCase();
          
          // 1. Exact match - this would be ideal
          if (backlinkMonthStr === selectedMonth.toLowerCase()) {
            console.log(`Exact match for backlink "${backlink.Name}": ${backlinkMonthStr} = ${selectedMonth.toLowerCase()}`);
            return true;
          }
          
          // 2. Parse the backlink month to extract month name and year
          const backlinkMonthParts = backlinkMonthStr.split(' ');
          const backlinkMonthName = backlinkMonthParts[0];
          const backlinkYear = backlinkMonthParts.length > 1 ? backlinkMonthParts[1] : '';
          
          // 3. Match both month name and year - enforce year matching
          const monthNameMatches = backlinkMonthName === selectedMonthName || 
                                  backlinkMonthName.includes(selectedMonthName) || 
                                  selectedMonthName.includes(backlinkMonthName);
          const yearMatches = backlinkYear === selectedYear;
          
          // Log for debugging
          console.log('Backlink month check:', { 
            name: backlink.Name,
            backlinkMonth: backlinkMonthStr,
            backlinkMonthName,
            backlinkYear,
            selectedMonthName,
            selectedYear,
            monthNameMatches,
            yearMatches,
            passes: monthNameMatches && yearMatches
          });
          
          // Only return true if both month name AND year match
          return monthNameMatches && yearMatches;
        } catch (e) {
          console.error('Error filtering backlink by month:', e, backlink);
          return false;
        }
      });
    }

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      filtered = filtered.filter(backlink => {
        const status = String(backlink.Status || backlink['Portal Status'] || '').toLowerCase();
        return status === statusFilter.toLowerCase() ||
              (statusFilter === 'live' && (status === 'live' || status.includes('complete')));
      });
    }

    // Apply DR filter if not 'all'
    if (drFilter !== 'all') {
      filtered = filtered.filter(backlink => {
        const drValue = backlink['DR ( API )'] || backlink.DomainRating || backlink['Domain Authority/Rating'] || 0;
        return parseInt(drValue) >= parseInt(drFilter);
      });
    }

    // Apply sorting
    filtered = sortItems(filtered, backlinkSort);
    
    return filtered;
  };

  // Helper function to apply filters to YouTube Scripts
  const applyYoutubeScriptFilters = (data: any[]) => {
    let filtered = data;
    
    console.log('YouTube Scripts data before filtering:', data);
    console.log('YouTube Scripts count:', data.length);
    console.log('YouTube Scripts status values:', data.map(script => ({
      'Script Status': script['Script Status'],
      'Script Status for Deliverables': script['Script Status for Deliverables'],
      'YouTube Status': script['YouTube Status']
    })));
    console.log('YouTube Scripts month values:', data.map(script => ({
      'Target Month': script['Target Month'],
      'Month': script['Month'],
      'keyword': script['Keyword Topic']
    })));
    console.log('Current YouTube Scripts status filter:', youtubeScriptStatusFilter);
    console.log('Current month filter:', selectedMonth);
    
    // Apply month filter
    if (selectedMonth && data.length > 0) {
      // Parse the selected month to get standardized parts
      const selectedMonthParts = selectedMonth.toLowerCase().split(' ');
      const selectedMonthName = normalizeMonthName(selectedMonthParts[0]);
      const selectedYear = selectedMonthParts.length > 1 ? selectedMonthParts[1] : new Date().getFullYear().toString();
      
      console.log('Filtering YouTube scripts with month parts:', { selectedMonthName, selectedYear, selectedMonth });
      
      filtered = filtered.filter(script => {
        try {
          // Handle different month formats
          let scriptMonth = script['Target Month'];
          
          // Handle case where Month is an object with a name property
          if (scriptMonth && typeof scriptMonth === 'object' && 'name' in scriptMonth) {
            scriptMonth = scriptMonth.name;
          } else if (scriptMonth && typeof scriptMonth === 'object' && 'value' in scriptMonth) {
            scriptMonth = scriptMonth.value;
          }
          
          // Handle null or undefined month
          if (!scriptMonth) {
            return false;
          }
          
          // Convert to string for comparison and make case-insensitive
          const scriptMonthStr = String(scriptMonth).toLowerCase();
          
          // 1. Exact match - this would be ideal
          if (scriptMonthStr === selectedMonth.toLowerCase()) {
            console.log(`Exact match for script "${script['Keyword Topic']}": ${scriptMonthStr} = ${selectedMonth.toLowerCase()}`);
            return true;
          }
          
          // 2. Parse the script month to extract month name and year
          const scriptMonthParts = scriptMonthStr.split(' ');
          const scriptMonthName = normalizeMonthName(scriptMonthParts[0]);
          const scriptYear = scriptMonthParts.length > 1 ? scriptMonthParts[1] : '';
          
          // 3. Match both month name AND year for strict filtering
          const monthNameMatches = scriptMonthName === selectedMonthName;
          const yearMatches = scriptYear === selectedYear;
          
          // Log for debugging
          console.log('Script month check:', { 
            keyword: script['Keyword Topic'],
            scriptMonth: scriptMonthStr,
            scriptMonthName,
            scriptYear,
            selectedMonthName,
            selectedYear,
            monthNameMatches,
            yearMatches,
            passes: monthNameMatches && yearMatches
          });
          
          // Return true if BOTH month name AND year match for strict filtering
          return monthNameMatches && yearMatches;
        } catch (e) {
          console.error('Error filtering YouTube script by month:', e, script);
          return false;
        }
      });
    }
    
    console.log('YouTube Scripts after month filtering:', filtered.length);

    // Apply status filter if not 'all'
    if (youtubeScriptStatusFilter !== 'all') {
      filtered = filtered.filter(script => {
        try {
          // Get the status field value - check both possible field names
          const status = String(script['Script Status'] || script['Script Status for Deliverables'] || '').toLowerCase();
          const filterStatus = youtubeScriptStatusFilter.toLowerCase();
          
          // Check for exact match or if the status contains the filter value
          const passes = status === filterStatus || 
                         status.includes(filterStatus) || 
                         // Handle specific status mappings
                         (filterStatus === 'idea' && (status.includes('idea') || status.includes('proposed'))) ||
                         (filterStatus === 'review' && (status.includes('review') || status.includes('internal review'))) ||
                         (filterStatus === 'draft' && (status.includes('draft') || status.includes('creation'))) ||
                         (filterStatus === 'revision' && (status.includes('revision') || status.includes('needs revision'))) ||
                         (filterStatus === 'awaiting client' && (status.includes('awaiting client') || status.includes('client depth'))) ||
                         (filterStatus === 'approved' && (status.includes('approved'))) ||
                         (filterStatus === 'production' && (status.includes('recording') || status.includes('editing') || status.includes('video')));
          
          console.log('Script status check:', { 
            id: script.id,
            keyword: script['Keyword Topic'],
            scriptTitle: script['Script Title'],
            actual: status, 
            filter: filterStatus, 
            passes 
          });
          
          return passes;
        } catch (e) {
          console.error('Error filtering YouTube script by status:', e, script);
          return false;
        }
      });
    }
    
    console.log('YouTube Scripts after status filtering:', filtered.length);
    console.log('Final filtered YouTube Scripts:', filtered.map(script => ({
      id: script.id,
      keyword: script['Keyword Topic'],
      month: script['Target Month'],
      status: script['Script Status for Deliverables']
    })));

    // Apply sorting
    filtered = sortItems(filtered, youtubeScriptSort);
    
    return filtered;
  };

  // Apply filters to Reddit Comments
  const applyRedditCommentFilters = (data: RedditComment[]) => {
    console.log('Applying Reddit comment filters...');
    
    // Filter by month if selected
    let filtered = [...data];
    
    if (selectedMonth) {
      console.log('Filtering by month:', selectedMonth);
      // Use 'Publication Date' field for month filtering
      filtered = filtered.filter(comment => {
        // Try to get a date from 'Publication Date' or 'Date Posted' field
        const publicationDate = comment['Publication Date'] || comment['Date Posted'];
        
        if (!publicationDate) {
          console.log(`Comment ${comment.id} has no publication date, excluding from filter`);
          return false;
        }
        
        try {
          // Parse the date - handle different format possibilities
          let commentDate: Date;
          if (typeof publicationDate === 'string') {
            // Try to parse various date formats
            if (publicationDate.includes('/')) {
              // Format like MM/DD/YYYY or DD/MM/YYYY
              const parts = publicationDate.split('/');
              // Assume MM/DD/YYYY format
              commentDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            } else if (publicationDate.includes('-')) {
              // ISO format YYYY-MM-DD
              commentDate = new Date(publicationDate);
            } else {
              // Try direct parsing
              commentDate = new Date(publicationDate);
            }
          } else if (typeof publicationDate === 'object' && publicationDate !== null && 
                    Object.prototype.toString.call(publicationDate) === '[object Date]') {
            commentDate = publicationDate as Date;
          } else {
            console.log(`Comment ${comment.id} has invalid date format: ${publicationDate}`);
            return false;
          }
          
          // If parsing worked, extract month and year
          if (!isNaN(commentDate.getTime())) {
            // Format as "Month YYYY" to match selectedMonth format
            const commentMonthYear = `${commentDate.toLocaleString('default', { month: 'long' })} ${commentDate.getFullYear()}`;
            console.log(`Comment ${comment.id} date: ${commentMonthYear}, selected: ${selectedMonth}`);
            return commentMonthYear === selectedMonth;
          }
          
          return false;
        } catch (error) {
          console.error(`Error parsing date for comment ${comment.id}:`, error);
          return false;
        }
      });
    }
    
    // Apply status filter if not set to 'all'
    if (redditCommentStatusFilter !== 'all') {
      console.log('Filtering by status:', redditCommentStatusFilter);
      filtered = filtered.filter(comment => comment.Status?.toLowerCase() === redditCommentStatusFilter.toLowerCase());
    }
    
    console.log(`After filtering, ${filtered.length} Reddit comments remain`);
    
    // Group comments by threadId
    const grouped = filtered.reduce<GroupedRedditComments>((acc, comment) => {
      const threadId = comment.threadId || 'unknown';
      if (!acc[threadId]) {
        acc[threadId] = [];
      }
      acc[threadId].push(comment);
      return acc;
    }, {});
    
    console.log(`Comments grouped into ${Object.keys(grouped).length} threads`);
    
    return grouped;
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
    console.log('Current YouTube scripts data length:', youtubeScripts.length);
    console.log('Current Reddit comments data length:', redditComments.length);
    
    // Log filter states
    console.log('Brief status filter:', briefStatusFilter);
    console.log('Article status filter:', articleStatusFilter);
    console.log('Backlink status filter:', statusFilter);
    console.log('YouTube Script status filter:', youtubeScriptStatusFilter);
    console.log('Reddit Comment status filter:', redditCommentStatusFilter);
    console.log('DR filter:', drFilter);

    // Apply filters to each data type
    setFilteredBriefs(applyBriefFilters(filterDataByClient(briefs)));
    setFilteredArticles(applyArticleFilters(filterDataByClient(articles)));
    setFilteredBacklinks(applyBacklinkFilters(filterDataByClient(backlinks)));
    setFilteredYoutubeScripts(applyYoutubeScriptFilters(filterDataByClient(youtubeScripts)));
    setFilteredRedditComments(applyRedditCommentFilters(filterDataByClient(redditComments)));
    
  }, [briefs, articles, backlinks, youtubeScripts, redditComments, selectedMonth, 
      briefStatusFilter, articleStatusFilter, statusFilter, youtubeScriptStatusFilter, 
      redditCommentStatusFilter, drFilter, briefSort, articleSort, backlinkSort, 
      youtubeScriptSort, redditCommentSort, clientId, filterDataByClient]);

  // Note: Status change handlers have been removed as we're using table views instead of kanban boards
  // Status changes are not part of the deliverables page requirements

  return (
    <main className="flex flex-1 flex-col gap-6 p-3 md:gap-8 md:p-1">
      {/* Fixed header container for summary cards and error messages */}
      <div className="bg-white flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-1" style={{ position: 'fixed', top: '64px', left: sidebarExpanded ? '256px' : '80px', right: '16px', paddingTop: '48px', paddingBottom: '16px', paddingLeft: '48px', paddingRight: '16px' }}>
        {/* Top-Level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 max-w-full">
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
          
          {/* YouTube Scripts Card - Green Border for YouTube Scripts */}
          <div className="rounded-lg border-8 p-6 bg-green-50 h-[104px] flex items-center shadow-sm border-green-400">
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-lg font-bold mb-1 notification-text">
                {filteredYoutubeScripts.length > 0
                  ? Math.round((filteredYoutubeScripts.filter(script => 
                      String(script['Script Status for Deliverables'] || '').toLowerCase().includes('approved')
                    ).length / filteredYoutubeScripts.length) * 100)
                  : 0}%
              </span>
              <span className="text-sm text-darkGray">Scripts Approved</span>
            </div>
          </div>

          {/* Reddit Comments Card - Purple/Pink Border for Reddit Comments */}
          <div className="rounded-lg border-8 p-6 bg-pink-50 h-[104px] flex items-center shadow-sm border-pink-400">
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-lg font-bold mb-1 notification-text">
                {Object.values(filteredRedditComments).flat().length > 0
                  ? Math.round((Object.values(filteredRedditComments).flat().filter(comment => 
                      String(comment.Status || '').toLowerCase() === 'posted'
                    ).length / Object.values(filteredRedditComments).flat().length) * 100) + '%'
                  : '0%'}
              </span>
              <span className="text-sm text-gray-500">Reddit Comments Posted</span>
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
                    { id: 'backlinks', label: 'Backlinks', icon: <Link2 size={18} /> },
                    { id: 'youtubescripts', label: 'Youtube Scripts', icon: <Video size={18} /> },
                    { id: 'redditcomments', label: 'Reddit Comments', icon: <MessageCircle size={18} /> }
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

              {mainTab === 'youtubescripts' && (
                <>
                  <select
                    className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                    value={youtubeScriptStatusFilter}
                    onChange={(e) => setYoutubeScriptStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="idea">Idea Phase</option>
                    <option value="script creation">Script Creation</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="awaiting client">Awaiting Client</option>
                    <option value="revision">Needs Revision</option>
                    <option value="approved">Approved</option>
                    <option value="production">In Production</option>
                  </select>
                  {youtubeScriptStatusFilter !== 'all' && (
                    <button
                      onClick={() => setYoutubeScriptStatusFilter('all')}
                      className="px-3 py-2 text-sm text-primary border border-primary rounded-md bg-white hover:bg-primary hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}

              {mainTab === 'redditcomments' && (
                <>
                  <select
                    className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                    value={redditCommentStatusFilter}
                    onChange={(e) => setRedditCommentStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="posted">Posted</option>
                    <option value="proposed">Proposed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {redditCommentStatusFilter !== 'all' && (
                    <button
                      onClick={() => setRedditCommentStatusFilter('all')}
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
      <div style={{ height: '350px' }}></div>

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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px] min-w-[150px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[150px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px] min-w-[120px]">GDOC LINK</TableHead>
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px] min-w-[150px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">GDOC LINK</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px] min-w-[120px]">ARTICLE URL</TableHead>
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px] min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[140px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[140px]">
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
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider min-w-[80px]">
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
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider min-w-[100px]">TRAFFIC</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[140px]">TARGET URL</TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider min-w-[160px]">TRAFFIC OF TARGET URL</TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider min-w-[160px]">RDs OF TARGET URL</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[130px]">ANCHOR TEXT</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[160px]">CLIENT TARGET URL</TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[160px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
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
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px] min-w-[120px]">NOTES</TableHead>
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

          {mainTab === 'youtubescripts' && (
            <div className="bg-white">
              <Table className="min-w-full divide-y divide-gray-200 bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px] min-w-[150px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'Script Title',
                            direction: prev?.column === 'Script Title' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        SCRIPT TITLE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[150px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'Keyword Topic',
                            direction: prev?.column === 'Keyword Topic' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        KEYWORD TOPIC
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[150px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'Video Title',
                            direction: prev?.column === 'Video Title' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        VIDEO TITLE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'YouTube Scripter',
                            direction: prev?.column === 'YouTube Scripter' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        SCRIPTER
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'Script Status',
                            direction: prev?.column === 'Script Status' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        STATUS
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'Target Month',
                            direction: prev?.column === 'Target Month' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        MONTH
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setYoutubeScriptSort(prev => ({
                            column: 'Script Approved Date',
                            direction: prev?.column === 'Script Approved Date' && prev?.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                        className="p-0 h-8 text-base font-medium flex items-center"
                      >
                        APPROVED DATE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-br-[12px] min-w-[120px]">SCRIPT LINK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {filteredYoutubeScripts.length > 0 ? (
                    filteredYoutubeScripts.map((script) => (
                      <TableRow key={script.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="px-4 py-4 text-base font-medium text-dark">{String(script['Script Title'] || '')}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(script['Keyword Topic'] || '')}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(script['Video Title'] || '')}</TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">{String(getUserName(script['YouTube Scripter']))}</TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                            ${String(script['Script Status'] || '').toLowerCase().includes('approved') ? 'bg-green-100 text-green-800' :
                            String(script['Script Status'] || '').toLowerCase().includes('review') ? 'bg-blue-200 text-blue-800' :
                            String(script['Script Status'] || '').toLowerCase().includes('awaiting') ? 'bg-yellow-200 text-yellow-800' :
                            String(script['Script Status'] || '').toLowerCase().includes('idea') ? 'bg-purple-200 text-purple-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {String(script['Script Status'] || 'Unknown')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800">
                            {String(script['Target Month'] || '-')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-base text-dark">
                          {script['Script Approved Date'] ? 
                            new Date(script['Script Approved Date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '-'}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {script['Script (G-Doc URL)'] ? (
                            <a
                              href={ensureUrlProtocol(String(script['Script (G-Doc URL)']))}
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
                      <TableCell colSpan={8} className="px-4 py-4 text-center text-gray-500">
                        No YouTube scripts available for {selectedMonth}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {mainTab === 'redditcomments' && (
            <div className="bg-white">
              {/* <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Reddit Comments</h2>
                  <p className="text-muted-foreground">
                    Grouped by thread, shows which comments have been posted and upvoted
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Status:</label>
                  <select
                    value={redditCommentStatusFilter}
                    onChange={(e) => setRedditCommentStatusFilter(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="posted">Posted</option>
                    <option value="proposed">Proposed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div> */}
              
              <Table className="min-w-full divide-y divide-gray-200 bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider rounded-bl-[12px] min-w-[60px]"></TableHead>
                    <TableHead className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider min-w-[180px]">REDDIT THREAD</TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider min-w-[100px]">COMMENTS</TableHead>
                    <TableHead className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider rounded-br-[12px] min-w-[150px]">UPVOTES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {Object.keys(filteredRedditComments).length > 0 ? (
                    Object.entries(filteredRedditComments).map(([threadId, comments]) => {
                      // Get thread details from the first comment
                      let threadTitle = comments[0]?.threadTitle || '';
                      
                      // Check for the dedicated Reddit Thread Name field first
                      if (comments[0] && comments[0]['Reddit Thread Name']) {
                        threadTitle = comments[0]['Reddit Thread Name'];
                        console.log(`Using dedicated Reddit Thread Name field in UI: ${threadTitle}`);
                      }
                      // If the thread title is empty or still showing an ID format, try to extract a better title
                      else if (!threadTitle || threadTitle === '(Empty)' || threadTitle.startsWith('Thread rec') || threadTitle === 'Reddit Discussion Thread') {
                        // Try to get a better title from the comment data
                        const firstComment = comments[0];
                        
                        // Create a map of thread IDs to thread records to help with lookups
                        const threadMap = new Map<string, any>(redditThreads.map(thread => [thread.id, thread]));
                        
                        // Try to get thread title directly from 'Reddit Thread' or 'Reddit Thread (Relation)' field
                        // This gives us access to the Airtable linked record format which includes the name
                        const threadRecord = firstComment && (firstComment['Reddit Thread'] || firstComment['Reddit Thread (Relation)']);
                        
                        if (threadRecord) {
                          // Use our helper function to extract the thread name from the linked record
                          // Pass the thread map to help with title lookups
                          const { id: extractedThreadId, value: extractedThreadName } = getLinkedRecordValue(threadRecord, threadMap);
                          
                          if (extractedThreadName) {
                            threadTitle = extractedThreadName;
                            console.log(`Using thread name from linked record helper: ${threadTitle}`);
                          }
                          // If we still don't have a title but have a thread ID, try to look it up directly
                          else if (extractedThreadId && threadMap.has(extractedThreadId)) {
                            const thread = threadMap.get(extractedThreadId) || {};
                            if (thread) {
                              // Extract title from the thread record
                              threadTitle = (thread as any).Title || (thread as any).Name || (thread as any).Keyword || 
                                        (typeof (thread as any)['Reddit Thread URL'] === 'string' ? 
                                         (thread as any)['Reddit Thread URL'].split('/').pop() : 'Reddit Thread');
                              console.log(`Found thread title from map for ${extractedThreadId}: ${threadTitle}`);
                            }
                          }
                        }
                        // Other fallbacks
                        else if (firstComment && firstComment['Topic']) {
                          // Fallback to Topic field
                          threadTitle = firstComment['Topic'];
                        } else {
                          // Generic title as last resort
                          threadTitle = 'Reddit Discussion';
                        }
                      }
                      
                      console.log(`Thread ${threadId} display title:`, threadTitle);
                      
                      return (
                        <RedditThreadRow 
                          key={threadId}
                          threadId={threadId}
                          threadTitle={threadTitle}
                          comments={comments}
                          threadMap={new Map(redditThreads.map(thread => [thread.id, thread]))}
                        />
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-base text-gray-500">
                        No Reddit comments available for {selectedMonth}
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

// RedditThreadRow component to handle collapsible threads
interface RedditThreadRowProps {
  threadId: string;
  threadTitle: string;
  comments: RedditComment[];
  threadMap?: Map<string, any>;
}

// RedditThreadRow component implementation
const RedditThreadRow = ({ threadId, threadTitle, comments, threadMap }: RedditThreadRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if we have a dedicated Reddit Thread Name from the first comment
  const firstComment = comments && comments.length > 0 ? comments[0] : null;
  let displayTitle = threadTitle;
  
  // Check if we have any comments
  const hasComments = Array.isArray(comments) && comments.length > 0;
  
  // Get the thread URL from the first comment if available
  const threadUrl = firstComment?.threadUrl || firstComment?.['Reddit Thread URL'] || '';
  
  if (firstComment && firstComment['Reddit Thread Name']) {
    displayTitle = firstComment['Reddit Thread Name'];
  }
  
  // If we still have a generic or empty title, try to find a better one
  if (!displayTitle || displayTitle === '(Empty)' || displayTitle === 'Reddit Discussion Thread') {
    // Fallback to other fields if available
    const thread = threadMap?.get(threadId);
    if (thread) {
      displayTitle = thread.Title || thread.Name || thread.Keyword || displayTitle;
    }
  }

  return (
    <React.Fragment>
      {/* Thread Row (parent) */}
      <TableRow 
        className="hover:bg-gray-50 cursor-pointer border-t-2 border-indigo-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="px-4 py-4 text-center">
          <button className={`p-1 rounded-full hover:bg-gray-200 ${!hasComments ? 'opacity-50' : ''}`}>
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </TableCell>
        <TableCell className="px-4 py-4 font-medium">
          {threadUrl ? (
            <a 
              href={ensureUrlProtocol(threadUrl)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {displayTitle}
            </a>
          ) : (
            displayTitle
          )}
        </TableCell>
        <TableCell className="px-4 py-4 text-center">
          {hasComments ? comments.length : 0}
        </TableCell>
        <TableCell className="px-4 py-4 text-center">
          {/* Show a simpler status indicator - just Posted count */}
          {hasComments && (() => {
            // Count posted comments
            const postedCount = comments.filter(comment => comment.Status === 'Posted').length;
            
            if (postedCount > 0) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Posted ({postedCount})
                </span>
              );
            } else {
              // Return empty for non-posted comments
              return null;
            }
          })()}
        </TableCell>
      </TableRow>
      
      {/* Comment Rows (children) - only shown when expanded and there are comments */}
      {isExpanded && hasComments && comments.map((comment, index) => {
        // Get the upvotes for this individual comment
        const upvotes = typeof comment['Current N° Of Upvotes'] === 'number' ? comment['Current N° Of Upvotes'] : 
                       typeof comment['Current N° Of Upvotes'] === 'string' && !isNaN(Number(comment['Current N° Of Upvotes'])) ? 
                       Number(comment['Current N° Of Upvotes']) :
                       typeof comment.Votes === 'number' ? comment.Votes : 
                       typeof comment.Votes === 'string' && !isNaN(Number(comment.Votes)) ? 
                       Number(comment.Votes) : 0;
        
        return (
          <TableRow key={`${threadId}-${index}`} className="bg-gray-50 hover:bg-gray-100">
            <TableCell className="px-4 py-4"></TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <div className="flex items-center">
                <span className="mr-2 text-xs text-gray-500">Comment #{index + 1}</span>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                  ${comment.Status === 'Posted' ? 'bg-green-100 text-green-800' :
                  comment.Status === 'Proposed' ? 'bg-yellow-100 text-yellow-800' :
                  comment.Status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
                  {String(comment.Status || 'Unknown')}
                </span>
              </div>
              <div className="mt-1 text-sm">
                {comment.Status === 'Posted' 
                  ? String(comment['Comment Text Proposition (External)'] || '') 
                  : String(comment['Comment Text Proposition (Internal)'] || '')}
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm">
              {String(comment['Author Name (team pseudonym)'] || '-')}
            </TableCell>
            <TableCell className="px-4 py-3 text-center">
              {/* Show upvotes for all comments */}
              <span className="flex items-center justify-center">
                <span className="mr-1">
                  {upvotes >= 0 ? (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </span>
                <span className={`font-medium ${upvotes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(upvotes)}
                </span>
              </span>
            </TableCell>
          </TableRow>
        );
      })}
      
      {/* Show a message when there are no comments in an expanded thread */}
      {isExpanded && !hasComments && (
        <TableRow className="bg-gray-50">
          <TableCell className="px-4 py-4"></TableCell>
          <TableCell colSpan={3} className="px-4 py-3 text-sm text-gray-500 italic">
            No comments in this thread yet.
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

// Gets the current month and year in the format "Month YYYY"


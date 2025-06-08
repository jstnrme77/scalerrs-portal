'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button as ShadButton } from '@/components/ui/button'; 
import LinkButton from '@/components/ui/forms/LinkButton'; 
import Button from '@/components/ui/forms/Button'; 
import { ChecklistModal } from '@/components/ui/modals'; 
import { BarChart3, CheckSquare, Package, FileText, Info, MessageSquare, TrendingUp, Users, Settings, Calendar, AlertTriangle, Search, ExternalLink, Clock, Check, ChevronRight } from 'lucide-react'; 
import { checklistItems } from './data'; 
import { getLatestActivityLogs } from '../../lib/airtable';
import { fetchApprovalItems } from '@/lib/client-api-utils'; 
import { useClientData } from '@/context/ClientDataContext'; 
import Link from 'next/link';
import useMonthProgress from '@/lib/useMonthProgress';

const formatDate = (isoString: string) => {
  if (!isoString) return 'Date N/A';
  try {
    const date = new Date(isoString);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const formatRelativeTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

interface ActivityLog {
  id: string;
  Timestamp: string;
  Description: string;
  Category?: string;
  UserSource?: string | { name?: string }; 
  [key: string]: any; // Allow other fields from Airtable
}

interface GroupedActivityLogs {
  [category: string]: ActivityLog[];
}

interface ClientActionItem {
  id: string;
  name: string;
  status: string;
}

interface ClientActionItemExample {
  id: string;
  name: string; 
  status: string;
  type: string; 
}

interface ClientActionsByCategory {
  [category: string]: number;
}

export default function Home() {
  const currentM = new Date().toLocaleString('default', { month: 'long' });
  const [checklist, setChecklist] = useState(checklistItems);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [clientActionsByCategory, setClientActionsByCategory] = useState<ClientActionsByCategory>({});
  const [totalClientActionItemCount, setTotalClientActionItemCount] = useState(0);
  const [isLoadingClientActions, setIsLoadingClientActions] = useState(true);

  const { clientId: contextClientId, isLoading: isLoadingClientContext } = useClientData();
  const clientId = contextClientId;
  const { progress: monthProgress, monthName } = useMonthProgress();

  const handleChecklistItemToggle = (id: string, completed: boolean) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed } : item));
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Helper function to get display name for approval categories
  const getCategoryDisplayName = (type: string) => {
    switch (type) {
      case 'quickwins': return 'Quick Wins';
      case 'youtubetopics': return 'YouTube Topics';
      case 'youtubethumbnails': return 'YouTube Thumbnails';
      case 'redditthreads': return 'Reddit Threads';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  useEffect(() => {
    async function fetchActivities() {
      setIsLoadingLogs(true);
      try {
        const logs = await getLatestActivityLogs(10); // Fetch 10 latest logs. Pass only limit.
        setActivityLogs(logs);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      }
      setIsLoadingLogs(false);
    }

    async function fetchClientActionData() {
      setIsLoadingClientActions(true);

      const clientIdToUse = process.env.NEXT_PUBLIC_CLIENT_ID || clientId;

      if (!clientIdToUse || clientIdToUse === 'all') { // Restored 'all' check as it might have been relevant
        setClientActionsByCategory({});
        setTotalClientActionItemCount(0); 
        setIsLoadingClientActions(false);
        return;
      }
      
      try {
        // Define the approval item types to fetch
        const approvalTypes = ['keywords', 'briefs', 'articles', 'backlinks', 'quickwins', 'youtubetopics', 'youtubethumbnails', 'redditthreads'];
        
        // Fetch all items for each category regardless of status to match approvals page counts
        const promises = approvalTypes.map(async (type) => {
          try {
            // Fetch all items for this type with a large pageSize to get everything
            const result = await fetchApprovalItems(
              type,
              1, 
              100, // Large enough to get all items
              undefined, 
              undefined, 
              true, 
              clientIdToUse,
              undefined // Don't filter by status here, we'll do it client-side
            );
            
            // Filter items client-side to match the exact same criteria used in approvals page
            const pendingStatuses = ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'];
            
            // Only count items with pending statuses
            const pendingItems = result?.items?.filter(item => 
              pendingStatuses.includes(item.status)
            ) || [];
            
            return { 
              type, 
              count: pendingItems.length,
              category: getCategoryDisplayName(type)
            };
          } catch (error) {
            console.error(`Error fetching approval items for ${type}:`, error);
            return { 
              type, 
              count: 0,
              category: getCategoryDisplayName(type)
            }; 
          }
        });

        const results = await Promise.all(promises);
        
        const countsByCategory: ClientActionsByCategory = {};
        let totalPending = 0;
        
        results.forEach(result => {
          countsByCategory[result.category] = result.count;
          totalPending += result.count;
        });

        setClientActionsByCategory(countsByCategory);
        setTotalClientActionItemCount(totalPending);
      } catch (error) {
        console.error('Error fetching client action items in Promise.all:', error);
        setClientActionsByCategory({});
        setTotalClientActionItemCount(0);
      } finally {
        setIsLoadingClientActions(false);
      }
    };

    if (isLoadingClientContext) {
        // Wait for client context to load
        return;
    } else if (clientId || process.env.NEXT_PUBLIC_CLIENT_ID) {
        fetchActivities();
        fetchClientActionData();
    } else {
        setActivityLogs([]); // Clear logs if no client
        setIsLoadingLogs(false);
        setClientActionsByCategory({});
        setTotalClientActionItemCount(0);
        setIsLoadingClientActions(false);
    }
  }, [clientId, isLoadingClientContext]);

  // Limit the Latest-Activity card so it never grows taller than the
  // Campaign Progress card.  Show at most 6 of the newest log rows.
  const MAX_ACTIVITY_ITEMS = 6;

  const groupedLogs = useMemo(() => {
    // 1️⃣  Sort newest → oldest
    const sorted = [...activityLogs].sort((a, b) =>
      (new Date(b.Timestamp).getTime()) - (new Date(a.Timestamp).getTime())
    );

    // 2️⃣  Take only the first N items
    const limited = sorted.slice(0, MAX_ACTIVITY_ITEMS);

    // 3️⃣  Group by Category for the UI
    return limited.reduce((acc, log) => {
      const category = log.Category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(log);
      return acc;
    }, {} as GroupedActivityLogs);
  }, [activityLogs]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 flex flex-col gap-6"> 
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20 mr-3">
                  <CheckSquare className="h-6 w-6 text-[#9EA8FB]" />
                </div>
                <h2 className="text-2xl font-bold text-[#12131C]">Interactive Checklist</h2>
              </div>
              <p className="text-base text-[#12131C] mb-4">Track your progress with our interactive checklist.</p>
              <div className="flex-grow flex flex-col items-center justify-center">
                <div className="relative h-24 w-24 mb-2">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle className="stroke-[#F0F0F7] stroke-[8px] fill-none" cx="50" cy="50" r="38"></circle>
                    <circle className="stroke-[#9EA8FB] stroke-[8px] fill-none get-started-circle" cx="50" cy="50" r="38" strokeDasharray="238.76104167282426" strokeDashoffset={238.76104167282426 - (238.76104167282426 * progressPercentage / 100)}></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#12131C]">{completedCount}/{totalCount}</span>
                  </div>
                </div>
                <p className="text-base text-[#12131C]">Tasks Completed</p>
              </div>
              <div className="mt-auto pt-6">
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-auto get-started-btn text-base w-full"
                  onClick={() => setChecklistModalOpen(true)}
                >
                  Resume Checklist
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6E8FD] mr-3 flex-shrink-0">
                  <Package className="h-5 w-5 text-[#9EA8FB]" />
                </div>
                <h2 className="text-2xl font-bold text-[#12131C]">Client Actions Needed</h2>
              </div>
              <p className="text-base text-[#4F515E] mb-6 ml-13">Review items that require your attention.</p>
              <div className="text-center my-auto py-4 flex-grow flex flex-col justify-center items-center">
                {isLoadingClientActions || isLoadingClientContext ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9EA8FB] mb-4"></div>
                    <p className="text-base text-[#4F515E]">Loading actions...</p>
                  </div>
                ) : totalClientActionItemCount > 0 ? (
                  <div className="space-y-2 w-full px-4">
                    <div className="flex flex-col items-center mb-4">
                      <AlertTriangle size={36} className="text-yellow-500 mb-2" />
                      <p className="text-lg font-semibold text-[#12131C]">
                        {totalClientActionItemCount} item{totalClientActionItemCount > 1 ? 's' : ''} require attention
                      </p>
                    </div>
                    
                    {Object.keys(clientActionsByCategory).length > 0 && (
                      <ul className="text-sm text-gray-700 list-none p-0 text-left divide-y divide-gray-200">
                        {Object.entries(clientActionsByCategory).map(([category, count]) => (
                          <li key={category} className="py-1.5 flex justify-between items-center">
                            <span className="capitalize">{category.replace(/s$/, '')}:</span>
                            <span className="font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-[#FFF7E6] p-4 rounded-lg inline-block mb-3">
                      <CheckSquare size={32} className="text-[#FFA726]" />
                    </div>
                    <p className="text-lg font-semibold text-[#12131C]">No pending actions</p>
                    <p className="text-sm text-[#4F515E]">
                      {(!clientId || clientId === 'all') && !isLoadingClientContext 
                        ? 'Select a client to view specific actions.' 
                        : 'All items are up-to-date for the selected client.'}
                    </p>
                  </>
                )}
              </div>
              <div className="mt-auto pt-4">
                <LinkButton href="/approvals" variant="primary" className="text-base w-full">
                  View Approvals
                </LinkButton>
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9EA8FB]/20 mr-3">
                <BarChart3 className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#12131C]">Campaign Progress</h2>
                <p className="text-base text-[#4F515E]">Track your monthly campaign milestones and goals</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#12131C] mb-3">
                {monthName ? `${monthName} Campaign Progress` : 'Loading...'}
              </h3>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-[#12131C]">Overall Status:</span>
                <span className="text-sm font-medium text-[#12131C]">
                  {monthProgress !== null ? `${monthProgress}%` : '--'} complete
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2.5 rounded-full bg-[#9EA8FB] transition-all duration-300"
                  style={{ width: monthProgress != null ? `${monthProgress}%` : '0%' }}></div>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <LinkButton href="/milestones" variant="primary" className="text-base get-started-btn w-full">
                View Monthly Plan
              </LinkButton>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="rounded-3xl border-8 border-[#F5F5F9] bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6E8FD] mr-3 flex-shrink-0">
                <Clock className="h-5 w-5 text-[#9EA8FB]" /> 
              </div>
              <h2 className="text-2xl font-bold text-[#12131C]">Latest Activity</h2>
            </div>
            <p className="text-base text-[#4F515E] mb-6 ml-13">Recent updates to your campaign</p>
            
            <div className="space-y-6 flex-grow overflow-y-auto pr-2">
              {isLoadingLogs ? (
                <p className="text-base text-[#4F515E]">Loading activities...</p>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([category, logs]) => (
                  <div key={category} className="border-l-4 border-[#9EA8FB] pl-4">
                    <h3 className="text-lg font-bold mb-2 capitalize">
                      {category.replace(/_/g, ' ')}
                    </h3>
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id}>
                          <p className="font-medium text-sm text-[#12131C] leading-tight">
                            {log.Description || 'No description provided.'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatRelativeTime(log.Timestamp)}
                            {log.UserSource && typeof log.UserSource === 'object' && log.UserSource.name && ` - by ${log.UserSource.name}`}
                            {log.UserSource && typeof log.UserSource === 'string' && ` - by ${log.UserSource}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base text-[#4F515E]">No recent activity to display.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        items={checklist}
        onItemToggle={handleChecklistItemToggle}
      />
    </>
  );
}

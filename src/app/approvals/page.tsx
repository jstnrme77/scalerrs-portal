'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { FileText, BookOpen, Link2, MessageCircle, ExternalLink, Award, Zap, BarChart2, TrendingUp, Clock, User, DollarSign, Calendar } from 'lucide-react';
import { updateApprovalStatus, clearApprovalsCache } from '@/lib/client-api-utils';
import Pagination from '@/components/ui/Pagination';
import { useClientData } from '@/context/ClientDataContext';
import { ConversationHistoryModal } from '@/components/ui/modals';
// Import the URL utility function
import { ensureUrlProtocol, formatDate } from '@/utils/field-utils';

// Add custom styles for compact tabs
const tabStyles = `
  .tab-item {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
    padding-top: 0.375rem !important;
    padding-bottom: 0.375rem !important;
    font-size: 0.875rem !important;
    height: auto !important;
    margin-right: 0.25rem !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 12px !important;
  }
  
  .tab-navigation .flex {
    flex-wrap: wrap !important;
    gap: 0.25rem !important;
    display: flex !important;
    width: 100% !important;
  }
  
  .page-container-tabs {
    overflow-x: hidden !important;
    width: 100% !important;
    display: flex !important;
    flex-wrap: wrap !important;
  }
  
  .tab-navigation {
    overflow-x: hidden !important;
    width: 100% !important;
    display: flex !important;
  }
  
  /* Force all tab navigation icons to be 16px */
  .tab-item svg,
  button svg,
  .tab-navigation svg {
    width: 16px !important;
    height: 16px !important;
  }
  
  /* Add specific styles for active and inactive tabs */
  .tab-item-active,
  .tab-item-inactive {
    border-radius: 12px !important;
  }
`;

// Direct API fetch function
async function directFetchApprovalItems(
  type: string,
  page: number = 1,
  pageSize: number = 10,
  clientId?: string,
  status?: string,
  useCache: boolean = true,
  addTimestamp: boolean = true,
  timestamp?: string
) {
  // Build URL with query parameters
  const params = new URLSearchParams({
    type,
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  // Important: Always include clientId parameter, even if it's 'all'
  // This ensures the API properly handles client filtering
  if (clientId) {
    params.append('clientId', clientId);
    console.log(`Including client filter: ${clientId}`);
  } else {
    params.append('clientId', 'all');
    console.log('No client filter, using "all"');
  }
  
  if (status) {
    params.append('status', status);
    console.log(`Including status filter: ${status}`);
  }
  
  console.log(`Fetching approvals with params: ${params.toString()}, useCache: ${useCache}`);
  
  // Always add a timestamp to avoid browser caching issues when requested
  if (addTimestamp) {
    const timestampValue = timestamp || Date.now().toString();
    params.append('_', timestampValue);
  }
  
  try {
    // Generate a cache key for this specific request
    const cacheKey = `approvals_${type}_${page}_${pageSize}_${clientId || 'all'}_${status || 'all'}`;
    
    // Check if we have a cached version in sessionStorage
    if (useCache && typeof window !== 'undefined') {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          const cacheTime = parsedData.timestamp || 0;
          const now = Date.now();
          
          // Use cache if it's less than 1 minute old
          if (now - cacheTime < 60000) {
            console.log(`Using cached data for ${cacheKey} (${Math.round((now - cacheTime) / 1000)}s old)`);
            return parsedData.data;
          } else {
            console.log(`Cache expired for ${cacheKey} (${Math.round((now - cacheTime) / 1000)}s old)`);
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
    }
    
    // Call the API endpoint directly with strong cache prevention headers
    const response = await fetch(`/api/approvals?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Use no-store to prevent the browser from using cached responses
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch approval items: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate that the response contains the expected data structure
    if (!data || !Array.isArray(data.items)) {
      console.error('Invalid response format from API', data);
      throw new Error('Invalid response format from API');
    }
    
    // Store in sessionStorage cache if using cache
    if (useCache && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        console.log(`Cached data for ${cacheKey}`);
      } catch (e) {
        console.error('Error caching data:', e);
      }
    }
    
    // Log the client ID filter for debugging
    if (clientId && clientId !== 'all') {
      console.log(`Received ${data.items.length} items from API for client ${clientId}`);
      
      // Verify all items belong to the client by checking the first few
      if (data.items.length > 0) {
        const sampleSize = Math.min(data.items.length, 3);
        console.log(`Sample verification of ${sampleSize} items for client ${clientId}:`);
        for (let i = 0; i < sampleSize; i++) {
          const item = data.items[i];
          const clientField = item.clients || item.clientRecordId;
          console.log(`- Item ${i+1} (${item.id}) client field:`, clientField);
        }
      }
    } else {
      console.log(`Received ${data.items.length} items from API (all clients)`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    // Return empty data structure instead of throwing to prevent UI breaks
    return {
      items: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextOffset: null,
        prevOffset: null
      }
    };
  }
}

// Comment Item Component
function CommentItem({ comment }: { comment: any }) {
  return (
    <div className="mb-2 last:mb-0 p-2">
      <div className="flex items-start">
        <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
          <span className="text-xs font-medium">{comment.author ? comment.author.charAt(0) : 'U'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="text-sm font-medium text-dark">{comment.author || 'User'}</span>
            <span className="text-xs text-mediumGray ml-2">{comment.timestamp || new Date().toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-dark mt-0.5">{comment.text}</p>
        </div>
      </div>
    </div>
  );
}

// Comments Section Component
function CommentsSection({ itemId, comments = [] }: { itemId: string, comments?: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [itemComments, setItemComments] = useState<any[]>(comments);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // In a real implementation, this would call an API to add the comment
      // For now, we'll just add it to the local state
      const newCommentObj = {
        id: `comment-${Date.now()}`,
        author: 'You',
        text: newComment,
        timestamp: new Date().toLocaleDateString()
      };

      setItemComments([...itemComments, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-primary hover:underline"
      >
        <MessageCircle size={14} className="mr-1" />
        {isExpanded ? 'Hide Comments' : `View Comments (${itemComments.length})`}
      </button>

      {isExpanded && (
        <div className="mt-2">
          <div className="bg-gray-50 p-3 rounded-md mb-2 border border-gray-200">
            {itemComments.length > 0 ? (
              itemComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="text-sm text-mediumGray">No comments yet</p>
            )}
          </div>

          <div className="flex mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#9EA8FB]"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className={`ml-2 px-3 py-1 text-sm font-medium rounded-md ${
                newComment.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let bgColor = '';
  let textColor = '';
  let displayText = '';

  switch (status) {
    // New standardized statuses
    case 'not_started':
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-700';
      displayText = 'Not Started';
      break;
    case 'in_progress':
      bgColor = 'bg-blue-50';
      textColor = 'text-gray-700';
      displayText = 'In Progress';
      break;
    case 'ready_for_review':
      bgColor = 'bg-purple-50';
      textColor = 'text-gray-700';
      displayText = 'Ready for Review';
      break;
    case 'awaiting_approval':
      bgColor = 'bg-yellow-50';
      textColor = 'text-gray-700';
      displayText = 'Awaiting Approval';
      break;
    case 'revisions_needed':
      bgColor = 'bg-orange-50';
      textColor = 'text-gray-700';
      displayText = 'Revisions Needed';
      break;
    case 'approved':
      bgColor = 'bg-green-50';
      textColor = 'text-gray-700';
      displayText = 'Approved';
      break;
    case 'published':
      bgColor = 'bg-emerald-50';
      textColor = 'text-gray-700';
      displayText = 'Published';
      break;

    // Legacy statuses for backward compatibility
    case 'resubmitted':
      bgColor = 'bg-blue-50';
      textColor = 'text-gray-700';
      displayText = 'Resubmitted';
      break;
    case 'needs_revision':
      bgColor = 'bg-orange-50';
      textColor = 'text-gray-700';
      displayText = 'Revisions Needed';
      break;
    case 'rejected':
      bgColor = 'bg-red-50';
      textColor = 'text-gray-700';
      displayText = 'Rejected';
      break;
    default:
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-700';
      displayText = status.replace(/_/g, ' ');
  }

  return (
    <span className={`inline-block px-2 py-1 text-base font-medium rounded-[12px] ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

// Approval Item Card Component (Not used in the table view, but kept for reference or alternative views)
function ApprovalItem({
  item,
  onApprove,
  onRequestChanges
}: {
  item: any;
  onApprove: (id: number) => void;
  onRequestChanges: (id: number) => void;
}) {
  return (
    <div className="p-4 rounded-lg border-2 border-[#9EA8FB] bg-white" style={{ color: '#353233' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
        <h3 className="text-md font-medium text-dark">{item.item}</h3>
        <StatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {'strategist' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Strategist:</span> {item.strategist}
          </div>
        )}

        {'volume' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Volume:</span> {item.volume}
          </div>
        )}

        {'difficulty' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Difficulty:</span> {item.difficulty}
          </div>
        )}

        {'type' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Type:</span> {item.type}
          </div>
        )}

        {'wordCount' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Word Count:</span> {item.wordCount}
          </div>
        )}

        {'count' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Links:</span> {item.count}
          </div>
        )}

        {'pages' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Pages:</span> {item.pages}
          </div>
        )}

        {'lastUpdated' in item && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Last Updated:</span> {item.lastUpdated}
          </div>
        )}
      </div>

      {item.revisionReason && (
        <div className="text-sm text-[#9EA8FB] bg-[#9EA8FB]/10 p-2 rounded mb-3 border border-[#9EA8FB]/30">
          <span className="font-medium">Revision Needed:</span> {item.revisionReason}
        </div>
      )}

      {(item.status === 'awaiting_approval' || item.status === 'resubmitted' || item.status === 'needs_revision') && (
        <div className="flex space-x-2">
          <button
            onClick={() => onApprove(item.id)}
            className="px-4 py-1 text-base font-medium text-white bg-black rounded-[12px] hover:bg-gray-800 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onRequestChanges(item.id)}
            className="px-4 py-1 text-base font-medium text-[#353233] border border-[#D9D9D9] rounded-[12px] hover:bg-gray-100 transition-colors"
          >
            Request Changes
          </button>
        </div>
      )}
    </div>
  );
}

// Revisions Needed Modal Component
function RejectionModal({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-200">
        <div className="bg-gray-50 p-3 mb-4 rounded-lg border-b border-black">
          <h3 className="text-lg font-medium text-dark">Revisions Needed</h3>
          <p className="text-mediumGray text-sm">Please provide details about the revisions needed:</p>
        </div>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
          rows={4}
          placeholder="Describe the changes needed..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1 text-base font-medium text-[#353233] border border-[#D9D9D9] rounded-[12px] hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
                setReason('');
              }
            }}
            disabled={!reason.trim()}
            className={`px-4 py-1 text-base font-medium rounded-[12px] transition-colors ${reason.trim() ? 'text-white bg-black hover:bg-gray-800' : 'text-white bg-gray-400 cursor-not-allowed'}`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

// Global Summary Banner Component
function GlobalSummaryBanner({
  counts,
  isLoading,
  clientId
}: {
  counts: { [key: string]: number },
  isLoading: boolean,
  clientId: string | null
}) {
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const categoriesCount = Object.values(counts).filter(count => count > 0).length;

  // Get client-specific text
  const clientText = clientId && clientId !== 'all' ? 'for the selected client' : '';

  return (
    <div className="p-6 rounded-lg mb-6 border-8 border-[#9EA8FB] bg-[#9EA8FB]/10 shadow-sm relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-dark text-lg mb-1 notification-text">
            {isLoading ? 'Loading Approvals...' : 'Pending Approvals'}
          </p>
          {isLoading ? (
            <div className="flex flex-col">
              <div className="animate-pulse bg-gray-200 h-4 w-48 rounded mb-2"></div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#9EA8FB] animate-ping mr-2"></div>
                <p className="text-xs text-gray-500">Fetching all records for accurate counts...</p>
              </div>
            </div>
          ) : (
            <p className="text-base text-mediumGray">
              You have {totalCount} items awaiting your review across {categoriesCount} categories
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Sidebar Summary Panel Component
function SidebarSummaryPanel({
  counts,
  totalApproved,
  totalPending,
  isLoading,
  clientId
}: {
  counts: { [key: string]: number },
  totalApproved: number,
  totalPending: number,
  isLoading: boolean,
  clientId: string | null
}) {
  // Calculate the percentage for the progress circle
  const percentage = totalPending > 0 ? (totalApproved / (totalApproved + totalPending)) * 100 : 0;
  const totalItems = totalApproved + totalPending;

  // Get client-specific title
  const clientText = clientId && clientId !== 'all' ? 'Client' : 'All Clients';
  const title = isLoading ? 'Loading...' : `Pending Approvals`;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative z-10">
      <h3 className="font-medium text-dark mb-3 text-center text-base">{title}</h3>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9EA8FB] mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mb-2"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-24 rounded mb-3"></div>
          <p className="text-xs text-gray-400 text-center px-2">
            Loading all records for accurate counts...
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#9EA8FB"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * percentage / 100)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-dark">{totalApproved} <span className="text-sm font-normal mx-1">of</span> {totalItems}</span>
              <span className="text-xs text-mediumGray text-center mt-1">items</span>
              <span className="text-xs text-mediumGray text-center">approved</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-base">
        {isLoading ? (
          <>
            {['Keywords', 'Briefs', 'Articles', 'Backlinks'].map((category) => (
              <div key={category} className="flex justify-between py-2 border-b border-black">
                <span className="text-dark">{category}</span>
                <div className="animate-pulse bg-gray-200 h-4 w-6 rounded"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="flex justify-between py-2 border-b border-black">
              <span className="text-dark">Keywords</span>
              <span className="font-medium text-dark">{counts.keywords}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black">
              <span className="text-dark">Briefs</span>
              <span className="font-medium text-dark">{counts.briefs}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black">
              <span className="text-dark">Articles</span>
              <span className="font-medium text-dark">{counts.articles}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black">
              <span className="text-dark">Backlinks</span>
              <span className="font-medium text-dark">{counts.backlinks}</span>
            </div>
            {counts.quickwins > 0 && (
              <div className="flex justify-between py-2 border-b border-black">
                <span className="text-dark">Quick Wins</span>
                <span className="font-medium text-dark">{counts.quickwins}</span>
              </div>
            )}
            {counts.youtubetopics > 0 && (
              <div className="flex justify-between py-2 border-b border-black">
                <span className="text-dark">YT Topics</span>
                <span className="font-medium text-dark">{counts.youtubetopics}</span>
              </div>
            )}
            {counts.youtubethumbnails > 0 && (
              <div className="flex justify-between py-2 border-b border-black">
                <span className="text-dark">YT Thumbnails</span>
                <span className="font-medium text-dark">{counts.youtubethumbnails}</span>
              </div>
            )}
            {counts.redditthreads > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-dark">Reddit Threads</span>
                <span className="font-medium text-dark">{counts.redditthreads}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



// Approval Card Component
function ApprovalCard({
  item,
  isSelected,
  showInteractiveCheckbox,
  activeTab,
  onToggleItemSelection,
  onApprove,
  onRequestChanges,
  openConversationModal
}: {
  item: ApprovalItem;
  isSelected: boolean;
  showInteractiveCheckbox: boolean;
  activeTab: string;
  onToggleItemSelection: (id: string) => void;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  openConversationModal: (itemId: string, itemTitle: string) => void;
}) {
  // Determine document link based on active tab
  const getDocumentLink = () => {
    if (activeTab === 'briefs') {
      return item.documentLink || 
             item['Content Brief Link (G Doc)'] || 
             item['Brief Document Link'] || 
             null;
    } else if (activeTab === 'articles') {
      return item.documentLink || 
             item['Written Content (G Doc)'] || 
             item['Content Link (G Doc)'] ||
             item['Article Document Link'] ||
             null;
    }
    return null;
  };

  const documentLink = getDocumentLink();

  // Special layout for backlinks
  if (activeTab === 'backlinks') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${isSelected ? 'bg-gray-50 border-blue-200' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center justify-center mt-3">
            {showInteractiveCheckbox ? (
              <input
                type="checkbox"
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
                checked={isSelected}
                onChange={() => onToggleItemSelection(item.id)}
              />
            ) : (
              <div className="h-4 w-4"></div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* First Row: URL and Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-400" />
                <span className="text-lg font-semibold text-gray-900">{item.item}</span>
              </div>
              <StatusBadge status={item.status} />
            </div>

            {/* Second Row: Link Type */}
            <div className="mb-6">
              {item.linkType && (
                <span className="text-sm text-gray-600">Link Type: <span className="font-semibold">{item.linkType}</span></span>
              )}
            </div>

            {/* Metrics Grid - First Row */}
            <div className="grid grid-cols-4 gap-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {item.domainRating || 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  DOMAIN RATING
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {item.trafficDomain ? item.trafficDomain.toLocaleString() : 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  DOMAIN TRAFFIC
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {item.pageTraffic || 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  PAGE TRAFFIC
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {item.pageRD || 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  REFERRING DOMAINS
                </div>
              </div>
            </div>

            {/* Metrics Grid - Second Row */}
            <div className="grid grid-cols-4 gap-8 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {item.pageType || 'Template'}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  PAGE TYPE
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {item.upliftPotential || 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  KEYWORD UPLIFT POTENTIAL
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {item.currentPosition || 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  CURRENT POSITION
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {item.keywordScore || 0}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  KEYWORD SCORE
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Target URL and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Target:</span>
                <a 
                  href={ensureUrlProtocol(String(item.targetPage || ''))} 
                  className="text-sm text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {String(item.targetPage || 'https://qwilr.com/templates/social-media-propos...')}
                </a>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {(['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)) && (
                  <>
                    <button
                      onClick={() => onRequestChanges(item.id)}
                      className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-6 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Revision Reason */}
            {item.revisionReason && (
              <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                <span className="font-medium">Revision: </span>{item.revisionReason}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Special layout for YouTube Topics
  if (activeTab === 'youtubetopics') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${isSelected ? 'bg-gray-50 border-blue-200' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center justify-center mt-3">
            {showInteractiveCheckbox ? (
              <input
                type="checkbox"
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
                checked={isSelected}
                onChange={() => onToggleItemSelection(item.id)}
              />
            ) : (
              <div className="h-4 w-4"></div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* First Row: Item Name and Actions */}
            <div className="flex items-center justify-between mb-1">
              {/* Item Name with Icon */}
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <span className="text-base font-semibold text-gray-900">{item.item}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {(['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)) && (
                  <>
                    <button
                      onClick={() => onRequestChanges(item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Second Row: Metrics */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              {item.videoType && <span>Video Type: <span className="font-semibold">{item.videoType}</span></span>}
              {item.targetMonth && <span>Target Month: <span className="font-semibold">{item.targetMonth}</span></span>}
              {item.competitorUrl && (
                <span>
                  <a 
                    href={ensureUrlProtocol(item.competitorUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Competitor
                  </a>
                </span>
              )}
            </div>

            {/* Third Row: Status, Last Updated and Assignment Info with Icons */}
            <div className="flex items-center gap-4 text-sm">
              <StatusBadge status={item.status} />
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Last Updated: <span className="font-semibold">{item.lastUpdated || 'N/A'}</span></span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <User className="h-3 w-3" />
                <span>Assigned to: <span className="font-semibold">{
                  (() => {
                    if (!item.strategist) return 'Team';
                    if (typeof item.strategist === 'string') return item.strategist;
                    if (Array.isArray(item.strategist)) {
                      return item.strategist.map(s => s.name).join(', ') || 'Team';
                    }
                    return item.strategist.name || 'Team';
                  })()
                }</span></span>
              </div>
            </div>

            {/* Fourth Row: View Conversation History Link */}
            <div className="mt-2">
              <button
                onClick={() => openConversationModal(item.id, item.item)}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <MessageCircle size={14} className="mr-1" />
                View Conversation History
              </button>
            </div>

            {/* Revision Reason */}
            {item.revisionReason && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                <span className="font-medium">Revision: </span>{item.revisionReason}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Special layout for YouTube Thumbnails
  if (activeTab === 'youtubethumbnails') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${isSelected ? 'bg-gray-50 border-blue-200' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center justify-center mt-3">
            {showInteractiveCheckbox ? (
              <input
                type="checkbox"
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
                checked={isSelected}
                onChange={() => onToggleItemSelection(item.id)}
              />
            ) : (
              <div className="h-4 w-4"></div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* First Row: Item Name and Actions */}
            <div className="flex items-center justify-between mb-1">
              {/* Item Name with Icon */}
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <span className="text-base font-semibold text-gray-900">{item.item}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {(['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)) && (
                  <>
                    <button
                      onClick={() => onRequestChanges(item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Third Row: Status, Last Updated and Assignment Info with Icons */}
            <div className="flex items-center gap-4 text-sm mb-2">
              <StatusBadge status={item.status} />
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Last Updated: <span className="font-semibold">{item.lastUpdated || 'N/A'}</span></span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <User className="h-3 w-3" />
                <span>Editor: <span className="font-semibold">{
                  (() => {
                    if (!item.thumbnailEditor) return 'Unassigned';
                    if (typeof item.thumbnailEditor === 'string') return item.thumbnailEditor;
                    if (Array.isArray(item.thumbnailEditor)) {
                      return item.thumbnailEditor.map((s: any) => s.name).join(', ');
                    }
                    return item.thumbnailEditor.name || 'Unassigned';
                  })()
                }</span></span>
              </div>
            </div>

            {/* Thumbnails Gallery - More compact */}
            <div className="my-3">
              <div className="grid grid-cols-3 gap-2">
                {item.thumbnail1 ? (
                  <div className="border border-gray-200 rounded overflow-hidden relative">
                    <div className="pb-[56.25%]"></div> {/* 16:9 aspect ratio */}
                    <img 
                      src={Array.isArray(item.thumbnail1) && item.thumbnail1[0]?.url ? item.thumbnail1[0].url : item.thumbnail1} 
                      alt="Thumbnail 1" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded relative bg-gray-50">
                    <div className="pb-[56.25%]"></div> {/* 16:9 aspect ratio */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      No Thumbnail #1
                    </div>
                  </div>
                )}
                
                {item.thumbnail2 ? (
                  <div className="border border-gray-200 rounded overflow-hidden relative">
                    <div className="pb-[56.25%]"></div> {/* 16:9 aspect ratio */}
                    <img 
                      src={Array.isArray(item.thumbnail2) && item.thumbnail2[0]?.url ? item.thumbnail2[0].url : item.thumbnail2} 
                      alt="Thumbnail 2" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded relative bg-gray-50">
                    <div className="pb-[56.25%]"></div> {/* 16:9 aspect ratio */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      No Thumbnail #2
                    </div>
                  </div>
                )}
                
                {item.thumbnail3 ? (
                  <div className="border border-gray-200 rounded overflow-hidden relative">
                    <div className="pb-[56.25%]"></div> {/* 16:9 aspect ratio */}
                    <img 
                      src={Array.isArray(item.thumbnail3) && item.thumbnail3[0]?.url ? item.thumbnail3[0].url : item.thumbnail3} 
                      alt="Thumbnail 3" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded relative bg-gray-50">
                    <div className="pb-[56.25%]"></div> {/* 16:9 aspect ratio */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      No Thumbnail #3
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes - More compact */}
            {item.notes && (
              <div className="mb-2 text-xs text-gray-700">
                <span className="font-medium">Notes: </span>{item.notes}
              </div>
            )}

            {/* Fourth Row: View Conversation History Link */}
            <div className="mt-1">
              <button
                onClick={() => openConversationModal(item.id, item.item)}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <MessageCircle size={14} className="mr-1" />
                View Conversation History
              </button>
            </div>

            {/* Revision Reason */}
            {item.revisionReason && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                <span className="font-medium">Revision: </span>{item.revisionReason}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Special layout for Reddit Threads
  if (activeTab === 'redditthreads') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${isSelected ? 'bg-gray-50 border-blue-200' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center justify-center mt-3">
            {showInteractiveCheckbox ? (
              <input
                type="checkbox"
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
                checked={isSelected}
                onChange={() => onToggleItemSelection(item.id)}
              />
            ) : (
              <div className="h-4 w-4"></div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* First Row: Item Name and Actions */}
            <div className="flex items-center justify-between mb-1">
              {/* Item Name with Icon */}
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <span className="text-base font-semibold text-gray-900">{item.item}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {(['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)) && (
                  <>
                    <button
                      onClick={() => onRequestChanges(item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Second Row: Thread URL */}
            {item.threadUrl && (
              <div className="mb-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Thread URL: </span>
                  <a 
                    href={ensureUrlProtocol(item.threadUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {item.threadUrl}
                  </a>
                </div>
              </div>
            )}

            {/* Third Row: Metrics */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-gray-400" />
                <span>Traffic: <span className="font-semibold">{item.threadTraffic || 0}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-gray-400" />
                <span>Value: <span className="font-semibold">{item.threadValue || '$0'}</span></span>
              </div>
              {item.targetMonth && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span>Month: <span className="font-semibold">{item.targetMonth}</span></span>
                </div>
              )}
            </div>

            {/* Fourth Row: Status, Last Updated and Assignment Info with Icons */}
            <div className="flex items-center gap-4 text-sm">
              <StatusBadge status={item.status} />
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Last Updated: <span className="font-semibold">{item.lastUpdated || 'N/A'}</span></span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <User className="h-3 w-3" />
                <span>Assignee: <span className="font-semibold">{
                  (() => {
                    if (!item.redditAssignee) return 'Unassigned';
                    if (typeof item.redditAssignee === 'string') return item.redditAssignee;
                    if (Array.isArray(item.redditAssignee)) {
                      return item.redditAssignee.map((s: any) => s.name).join(', ');
                    }
                    return item.redditAssignee.name || 'Unassigned';
                  })()
                }</span></span>
              </div>
            </div>

            {/* Fifth Row: View Conversation History Link */}
            <div className="mt-2">
              <button
                onClick={() => openConversationModal(item.id, item.item)}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <MessageCircle size={14} className="mr-1" />
                View Conversation History
              </button>
            </div>

            {/* Revision Reason */}
            {item.revisionReason && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                <span className="font-medium">Revision: </span>{item.revisionReason}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default layout for all other tabs
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${isSelected ? 'bg-gray-50 border-blue-200' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex items-center justify-center mt-3">
          {showInteractiveCheckbox ? (
            <input
              type="checkbox"
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
              checked={isSelected}
              onChange={() => onToggleItemSelection(item.id)}
            />
          ) : (
            <div className="h-4 w-4"></div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* First Row: Item Name and Actions */}
          <div className="flex items-center justify-between mb-1">
            {/* Item Name with Icon */}
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              {documentLink ? (
                <a
                  href={ensureUrlProtocol(documentLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-gray-900 hover:underline"
                >
                  {item.item}
                </a>
              ) : (
                <span className="text-base font-semibold text-gray-900">{item.item}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {(['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)) && (
                <>
                  <button
                    onClick={() => onRequestChanges(item.id)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => onApprove(item.id)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Second Row: Metrics */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            {activeTab === 'keywords' && (
              <>
                {item.volume && <span>Volume: <span className="font-semibold">{item.volume}</span></span>}
                {item.difficulty && <span>Difficulty: <span className="font-semibold">{item.difficulty}</span></span>}
              </>
            )}
            {activeTab === 'briefs' && (
              <>
                {item.pages && <span>Pages: <span className="font-semibold">{item.pages}</span></span>}
                {item.type && <span>Type: <span className="font-semibold">{item.type}</span></span>}
                {item.volume && <span>Volume: <span className="font-semibold">{item.volume}</span></span>}
              </>
            )}
            {activeTab === 'articles' && (
              <>
                {item.wordCount && <span>Words: <span className="font-semibold">{item.wordCount}</span></span>}
                {item.type && <span>Type: <span className="font-semibold">{item.type}</span></span>}
              </>
            )}
            {activeTab === 'quickwins' && (
              <>
                {item.count && <span>Links: <span className="font-semibold">{item.count}</span></span>}
                {item.type && <span>Type: <span className="font-semibold">{item.type}</span></span>}
              </>
            )}
          </div>

          {/* Third Row: Status, Last Updated and Assignment Info with Icons */}
          <div className="flex items-center gap-4 text-sm">
            <StatusBadge status={item.status} />
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Last Updated: <span className="font-semibold">{item.lastUpdated || 'N/A'}</span></span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              {activeTab === 'articles' ? (
                <>
                  <User className="h-3 w-3" />
                  <span>Assigned to: <span className="font-semibold">{
                    (() => {
                      if (!item.writer && !item.strategist) return 'Team';
                      if (typeof item.writer === 'string') return item.writer;
                      
                      if (item.writer) {
                        if (Array.isArray(item.writer)) {
                          return item.writer.map(w => w.name).join(', ') || 'Team';
                        }
                        return item.writer.name || 'Team';
                      }
                      
                      if (typeof item.strategist === 'string') return item.strategist;
                      if (Array.isArray(item.strategist)) {
                        return item.strategist.map(s => s.name).join(', ') || 'Team';
                      }
                      return item.strategist?.name || 'Team';
                    })()
                  }</span></span>
                </>
              ) : (
                <>
                  <User className="h-3 w-3" />
                  <span>Assigned to: <span className="font-semibold">{
                    (() => {
                      if (!item.strategist) return 'Team';
                      if (typeof item.strategist === 'string') return item.strategist;
                      if (Array.isArray(item.strategist)) {
                        return item.strategist.map(s => s.name).join(', ') || 'Team';
                      }
                      return item.strategist.name || 'Team';
                    })()
                  }</span></span>
                </>
              )}
            </div>
          </div>

          {/* Fourth Row: View Conversation History Link - only for Keywords and Briefs */}
          {(activeTab === 'keywords' || activeTab === 'briefs') && (
            <div className="mt-2">
              <button
                onClick={() => openConversationModal(item.id, item.item)}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <MessageCircle size={14} className="mr-1" />
                View Conversation History
              </button>
            </div>
          )}

          {/* Revision Reason */}
          {item.revisionReason && (
            <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border">
              <span className="font-medium">Revision: </span>{item.revisionReason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Table Component
function ApprovalTable({
  groupedItems,
  onApprove,
  onRequestChanges,
  selectedItems,
  onToggleItemSelection,
  onToggleGroupSelection,
  areAllItemsSelected,
  statusPagination,
  onStatusPageChange,
  activeTab,
  loadingStatus
}: {
  groupedItems: GroupedItems,
  onApprove: (id: string) => void,
  onRequestChanges: (id: string) => void,
  selectedItems: string[],
  onToggleItemSelection: (id: string) => void,
  onToggleGroupSelection: (items: ApprovalItem[], isSelected: boolean) => void,
  areAllItemsSelected: (items: ApprovalItem[]) => boolean,
  statusPagination: { [key: string]: PaginationState },
  onStatusPageChange: (status: string, page: number) => void,
  activeTab: string,
  loadingStatus: string | null
}) {
  // State for conversation history modal
  const [conversationModal, setConversationModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemTitle: string;
  }>({
    isOpen: false,
    itemId: '',
    itemTitle: ''
  });

  // Use ref to track which statuses have been updated to prevent infinite loops
  const updatedStatuses = useRef<Set<string>>(new Set());

  // Function to open conversation modal - with safety check for allowed content types
  const openConversationModal = (itemId: string, itemTitle: string) => {
    // Only allow opening the modal for specific tabs
    if (activeTab === 'keywords' || activeTab === 'briefs' || activeTab === 'youtubetopics' || activeTab === 'youtubethumbnails' || activeTab === 'redditthreads') {
      setConversationModal({
        isOpen: true,
        itemId,
        itemTitle
      });
    } else {
      console.log(`Conversation history not available for ${activeTab} tab`);
    }
  };
  
  // Reset updated statuses when groupedItems changes (e.g., when tab changes)
  useEffect(() => {
    updatedStatuses.current = new Set();
  }, [activeTab]);
  
  // Use effect to handle pagination updates for each status
  // This prevents setState during render errors
  useEffect(() => {
    // Check pagination for each status and update if needed
    Object.entries(groupedItems).forEach(([status, allItems]) => {
      if (allItems && allItems.length > 0) {
        const pageSize = 5; // 5 items per page for each status table
        const totalPages = Math.ceil(allItems.length / pageSize);
        
        // Only update if the pagination state is different AND we haven't updated this status yet
        if (
          statusPagination[status] && 
          statusPagination[status].totalPages !== totalPages && 
          !updatedStatuses.current.has(status)
        ) {
          console.log(`Updating pagination for ${status}: totalPages from ${statusPagination[status].totalPages} to ${totalPages}`);
          
          // Mark this status as updated to prevent infinite loops
          updatedStatuses.current.add(status);
          
          // Update pagination for this status
          onStatusPageChange(status, 1); // Reset to page 1 with correct pagination
        }
      }
    });
  // We only want to run this effect when groupedItems changes, not when statusPagination changes
  // This prevents the infinite loop where updating statusPagination triggers the effect again
  }, [groupedItems, onStatusPageChange]);
  
  // Define the order of status groups
  const statusOrder = [
    'not_started',
    'in_progress',
    'ready_for_review',
    'awaiting_approval',
    'revisions_needed',
    'approved',
    'published',
    // Legacy statuses for backward compatibility
    'resubmitted',
    'needs_revision',
    'rejected'
  ];

  // Status group headers
  const statusHeaders = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready_for_review: 'Ready for Review',
    awaiting_approval: 'Awaiting Approval',
    revisions_needed: 'Revisions Needed',
    approved: 'Approved',
    published: 'Published',
    // Legacy statuses for backward compatibility
    resubmitted: 'Resubmitted',
    needs_revision: 'Revisions Needed',
    rejected: 'Rejected'
  };

  // Function to render a table for a status group
  const renderStatusTable = (status: keyof GroupedItems) => {
    const allItems = groupedItems[status];

    // Only show status sections that have items or are currently loading
    if ((!allItems || allItems.length === 0) && loadingStatus !== status) return null;

    // Get pagination state for this status
    const pagination = statusPagination[status];

    // Calculate which items to show based on pagination
    const pageSize = 5; // 5 items per page for each status table
    const startIndex = (pagination.currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, allItems.length);
    const items = allItems.slice(startIndex, endIndex);
    
    // Calculate correct pagination values
    const totalPages = Math.ceil(allItems.length / pageSize);
    
    // If we're on a page that doesn't have any items but we're not loading,
    // show a message instead of redirecting
    if (items.length === 0 && pagination.currentPage > 1 && loadingStatus !== status) {
      console.log(`No items found for ${status} on page ${pagination.currentPage}`);
    }

    // Check if all items in this group are selected
    const allSelected = areAllItemsSelected(items);

    // Always show checkbox column for consistent layout, but only make them interactive for actionable items
    const showInteractiveCheckboxes = ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(status);

    return (
      <div key={status} className="mb-10">
        <h2 className="font-bold text-dark mb-4 text-lg">
          {statusHeaders[status as keyof typeof statusHeaders]} ({allItems.length})
        </h2>

        {loadingStatus === status ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#9EA8FB] animate-spin mr-3"></div>
            <span className="text-gray-500">Loading {statusHeaders[status as keyof typeof statusHeaders]}...</span>
          </div>
        ) : pagination.currentPage > 1 && items.length === 0 ? (
          <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 py-2 text-base">No items found on page {pagination.currentPage}.</p>
            <button
              onClick={() => onStatusPageChange(status, 1)}
              className="mt-2 px-4 py-1 text-sm font-medium text-[#353233] border border-[#D9D9D9] rounded-md hover:bg-gray-100 transition-colors"
            >
              Return to Page 1
            </button>
          </div>
        ) : items.length > 0 ? (
          <>
            {/* Header with select all checkbox */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {showInteractiveCheckboxes ? (
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
                    checked={allSelected}
                    onChange={() => onToggleGroupSelection(items, !allSelected)}
                  />
                ) : (
                  <div className="h-5 w-5"></div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {allSelected ? 'Deselect All' : 'Select All'} ({items.length} items)
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Showing {items.length} of {allItems.length} items
              </div>
            </div>

            {/* Cards Grid */}
            <div className="space-y-4">
              {items.map((item: ApprovalItem) => {
                const isSelected = selectedItems.includes(item.id);

                return (
                  <ApprovalCard
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    showInteractiveCheckbox={showInteractiveCheckboxes}
                    activeTab={activeTab}
                    onToggleItemSelection={onToggleItemSelection}
                    onApprove={onApprove}
                    onRequestChanges={onRequestChanges}
                    openConversationModal={openConversationModal}
                  />
                );
              })}
            </div>

            {/* Pagination for this status table */}
            {allItems.length > 5 && (
              <div className="mt-4">
                {loadingStatus === status ? (
                  <div className="flex justify-center items-center py-2">
                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-[#9EA8FB] animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading page {pagination.currentPage}...</span>
                  </div>
                ) : (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={Math.ceil(allItems.length / 5)}
                    onPageChange={(page) => onStatusPageChange(status, page)}
                    hasNextPage={pagination.currentPage < Math.ceil(allItems.length / 5)}
                    hasPreviousPage={pagination.currentPage > 1}
                    totalItems={allItems.length}
                    pageSize={5}
                    className="flex justify-center"
                    showPageNumbers={true}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 py-4 text-base">No items found in this section.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {statusOrder.map(status => renderStatusTable(status as keyof GroupedItems))}

      {/* Conversation History Modal - only render for allowed content types */}
      {(activeTab === 'keywords' || activeTab === 'briefs' || activeTab === 'youtubetopics' || activeTab === 'youtubethumbnails' || activeTab === 'redditthreads') && (
        <ConversationHistoryModal
          isOpen={conversationModal.isOpen}
          onClose={() => setConversationModal({ isOpen: false, itemId: '', itemTitle: '' })}
          itemId={conversationModal.itemId}
          itemTitle={conversationModal.itemTitle}
          contentType={activeTab as 'keywords' | 'briefs' | 'youtubetopics' | 'youtubethumbnails' | 'redditthreads'}
          enableAirtableComments={true}
        />
      )}
    </div>
  );
}

// Define the type for pagination state
type PaginationState = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextOffset: string | null;
  prevOffset: string | null;
};

// Define the type for approval items
interface ApprovalItem {
  id: string;
  item: string;
  status: string;
  dateSubmitted?: string;
  lastUpdated?: string;
  strategist?: string | { id: string; name: string; email: string } | Array<{ id: string; name: string; email: string }>;
  writer?: string | { id: string; name: string; email: string } | Array<{ id: string; name: string; email: string }>;
  volume?: number;
  difficulty?: string;
  wordCount?: number;
  type?: string;
  count?: number;
  pages?: number;
  dateApproved?: string;
  revisionReason?: string;
  documentLink?: string;
  resourceLink?: string;
  // Document links from Airtable fields
  'Content Brief Link (G Doc)': string;
  'Written Content (G Doc)': string;
  'Content Link (G Doc)': string;
  // Backlinks specific fields
  domainRating?: number;
  linkType?: string;
  targetPage?: string;
  wentLiveOn?: string;
  notes?: string;
  upliftPotential?: number;
  currentPosition?: number;
  pageType?: string;
  keywordScore?: number;
  comments?: Array<{ id: string; text: string; author?: string; timestamp?: string }>;
  airtableCommentCount?: number; // New field for Airtable comment count
  // Allow for additional fields
  [key: string]: any;
}

// Define the type for the items state
interface ApprovalItems {
  keywords: ApprovalItem[];
  briefs: ApprovalItem[];
  articles: ApprovalItem[];
  backlinks: ApprovalItem[];
  quickwins: ApprovalItem[];
  youtubetopics: ApprovalItem[];
  youtubethumbnails: ApprovalItem[];
  redditthreads: ApprovalItem[];
}

// Define the type for grouped items by status
interface GroupedItems {
  not_started: ApprovalItem[];
  in_progress: ApprovalItem[];
  ready_for_review: ApprovalItem[];
  awaiting_approval: ApprovalItem[];
  revisions_needed: ApprovalItem[];
  approved: ApprovalItem[];
  published: ApprovalItem[];
  // Legacy statuses for backward compatibility
  resubmitted: ApprovalItem[];
  needs_revision: ApprovalItem[];
  rejected: ApprovalItem[];
}

export default function Approvals() {
  // Use the client data context for client filtering
  const { clientId, isLoading: isClientLoading } = useClientData();

  const [activeTab, setActiveTab] = useState<string>('keywords');
  const [items, setItems] = useState<ApprovalItems>({
    keywords: [],
    briefs: [],
    articles: [],
    backlinks: [],
    quickwins: [],
    youtubetopics: [],
    youtubethumbnails: [],
    redditthreads: []
  });
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, itemId: '' });
  const [selectedItems, setSelectedItems] = useState<{[key: string]: string[]}>({
    keywords: [],
    briefs: [],
    articles: [],
    backlinks: [],
    quickwins: [],
    youtubetopics: [],
    youtubethumbnails: [],
    redditthreads: []
  });
  
  // Define pagination type
  type PaginationState = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextOffset: string | null;
    prevOffset: string | null;
  };

  // Default pagination state wrapped in useMemo to avoid dependency changes
  const defaultPagination = useMemo<PaginationState>(() => ({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextOffset: null,
    prevOffset: null
  }), []);

  // Track pagination for each status group
  const [statusPagination, setStatusPagination] = useState<{
    [key: string]: PaginationState
  }>({
    not_started: { ...defaultPagination },
    in_progress: { ...defaultPagination },
    ready_for_review: { ...defaultPagination },
    awaiting_approval: { ...defaultPagination },
    revisions_needed: { ...defaultPagination },
    approved: { ...defaultPagination },
    published: { ...defaultPagination },
    // Legacy statuses for backward compatibility
    resubmitted: { ...defaultPagination },
    needs_revision: { ...defaultPagination },
    rejected: { ...defaultPagination }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Add a separate loading state for summary components
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  // Add a state to track if all tabs data is loaded
  const [allTabsDataLoaded, setAllTabsDataLoaded] = useState<boolean>(false);
  const clientInitializedRef = useRef<boolean>(false);
  const currentClientRef = useRef<string | null>(null);

  // Clear all selections for the current tab
  const clearSelections = useCallback(() => {
    setSelectedItems(prev => {
      const newSelectedItems = { ...prev };
      newSelectedItems[activeTab as keyof typeof prev] = [];
      return newSelectedItems;
    });
  }, [activeTab]);

  // Fetch approvals data using the wrapper function
  const fetchData = useCallback(async (page: number = 1, status?: string, forceRefresh: boolean = false) => {
    try {
      // Don't fetch if client data isn't loaded yet
      if (isClientLoading) {
        console.log('Client data still loading, delaying fetch');
        return;
      }
      
      // Keep loading state active (should already be set)
      setIsLoading(true);
      // Keep the summary loading state active too
      setIsSummaryLoading(true);
      setLoadingStatus('Fetching approval items...');

      // Always get the latest clientId from context, NEVER default to 'all' unconditionally
      const client = clientId === null ? 'all' : clientId;
      
      // Update the current client ref
      currentClientRef.current = client;
      
      console.log(`Fetching approvals for client: ${client}`);
      
      // Only clear cache if force refresh is requested
      if (forceRefresh) {
        console.log(`Force refresh requested - clearing cache for ${activeTab} before fetching`);
        await clearApprovalsCache(activeTab); // Clear cache for current tab and wait for it to complete
      } else {
        console.log(`Using cached data if available for ${activeTab}`);
      }
      
      // Add a timestamp to avoid browser caching
      const timestamp = Date.now();
      
      // Use the wrapper function with strict client parameter
      const data = await directFetchApprovalItems(
        activeTab,
        page,
        100,
        client, // Always pass the client ID
        status,
        !forceRefresh, // Use cache unless force refresh is requested
        true,  // Always add timestamp
        timestamp.toString() // Add timestamp to avoid browser caching
      );
      
      // Validate the data - if we get an empty response or error, don't update state
      if (!data || !Array.isArray(data.items)) {
        console.error('Invalid or empty data received from API:', data);
        setLoadingStatus('Error loading data. Please try again.');
        return;
      }
      
      // Verify we're still on the same client
      if (currentClientRef.current !== client) {
        console.log(`Client changed during fetch: was ${client}, now ${currentClientRef.current}. Aborting data update.`);
        return;
      }
      
      console.log(`Fetched ${activeTab} data with ${data.items?.length || 0} items for client ${client}`);

      // Process the data into grouped items by status
      const groupedByStatus: GroupedItems = {
        not_started: [],
        in_progress: [],
        ready_for_review: [],
        awaiting_approval: [],
        revisions_needed: [],
        approved: [],
        published: [],
        // Legacy statuses
        resubmitted: [],
        needs_revision: [],
        rejected: []
      };

      // Process the items by status
      data.items.forEach((item: ApprovalItem) => {
        const itemStatus = item.status || 'not_started';
        if (groupedByStatus[itemStatus as keyof GroupedItems]) {
          groupedByStatus[itemStatus as keyof GroupedItems].push(item);
        } else {
          groupedByStatus.not_started.push(item);
        }
      });

      // Log item counts by status for debugging
      Object.entries(groupedByStatus).forEach(([status, statusItems]) => {
        if (statusItems.length > 0) {
          console.log(`Status ${status}: ${statusItems.length} items`);
        }
      });

      // Verify we're still on the same client before updating state
      if (currentClientRef.current !== client) {
        console.log(`Client changed during processing: was ${client}, now ${currentClientRef.current}. Aborting data update.`);
        return;
      }

      // Update the items state with the new data - completely replace the old data
      setItems(prev => ({
        ...prev,
        [activeTab]: [...data.items] // Use spread to create a new array reference
      }));
      
      // Set pagination for each status
      const paginationState: Record<string, PaginationState> = {};
      Object.keys(groupedByStatus).forEach(status => {
        const itemCount = groupedByStatus[status as keyof GroupedItems].length;
        const pageSize = 5; // 5 items per page for each status table
        const totalPages = Math.ceil(itemCount / pageSize);
        
        paginationState[status] = {
          currentPage: 1,
          totalPages: totalPages,
          totalItems: itemCount,
          hasNextPage: itemCount > pageSize,
          hasPrevPage: false,
          nextOffset: itemCount > pageSize ? '2' : null,
          prevOffset: null
        };
      });
      
      setStatusPagination(paginationState);
      setLoadingStatus(null);
      setInitialLoadComplete(true);
      
      // First update the main loading state
      setIsLoading(false);
      
      // Since this only loaded one tab, the allTabsDataLoaded state remains unchanged
      // Keep the summary loading state active if other tabs need to be loaded
      if (!allTabsDataLoaded) {
        // When loading a single tab, keep the summary loading until all tabs are loaded
        console.log('Keeping summary loading state active until all tabs are loaded');
      } else {
        // If all tabs were already loaded, we can turn off the summary loading
        setIsSummaryLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
      setLoadingStatus('Error fetching data. Please try again later.');
      setIsLoading(false);
      setIsSummaryLoading(false);
    }
  // Remove allTabsDataLoaded from dependency array to prevent infinite loops
  // We're checking its value inside, but we don't want changes to trigger re-creation
  }, [activeTab, clientId, isClientLoading]);

  // New function to fetch data for all tabs
  const fetchAllTabsData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Don't fetch if client data isn't loaded yet
      if (isClientLoading) {
        console.log('Client data still loading, delaying fetch for all tabs');
        return;
      }
      
      // Set both loading states to true at the start
      setIsLoading(true);
      setIsSummaryLoading(true);
      setAllTabsDataLoaded(false);
      setLoadingStatus('Fetching data for all tabs...');
      
      const client = clientId === null ? 'all' : clientId;
      
      // Update the current client ref
      currentClientRef.current = client;
      
      console.log(`Fetching all tabs data for client: ${client}, force refresh: ${forceRefresh}`);
      
      // If force refresh is requested, clear all caches
      if (forceRefresh) {
        console.log('Force refresh requested - clearing all caches before fetching');
        await clearApprovalsCache(); // Clear all caches
      }
      
      // Add a timestamp to avoid browser caching
      const timestamp = Date.now();
      
      // The tabs to fetch data for
      const tabsToFetch = ['keywords', 'briefs', 'articles', 'backlinks', 'quickwins', 'youtubetopics', 'youtubethumbnails'];
      
      // Create an object to store the fetched data
      const allTabsData: ApprovalItems = {
        keywords: [],
        briefs: [],
        articles: [],
        backlinks: [],
        quickwins: [],
        youtubetopics: [],
        youtubethumbnails: [],
        redditthreads: []
      };
      
      // Fetch data for each tab in parallel
      const fetchPromises = tabsToFetch.map(async (tab) => {
        try {
          console.log(`Fetching data for ${tab} tab...`);
          
          const data = await directFetchApprovalItems(
            tab,
            1,
            100,
            client,
            undefined,
            !forceRefresh, // Use cache unless force refresh is requested
            true, // Always add timestamp
            `${timestamp}_${tab}` // Add timestamp and tab to avoid cache collisions
          );
          
          // Validate the data
          if (data && Array.isArray(data.items)) {
            console.log(`Fetched ${data.items.length} items for ${tab} tab`);
            allTabsData[tab as keyof ApprovalItems] = [...data.items];
          } else {
            console.error(`Invalid or empty data received for ${tab} tab:`, data);
            allTabsData[tab as keyof ApprovalItems] = [];
          }
        } catch (error) {
          console.error(`Error fetching ${tab} data:`, error);
          allTabsData[tab as keyof ApprovalItems] = [];
        }
      });
      
      // Wait for all fetches to complete
      await Promise.all(fetchPromises);
      
      // Verify we're still on the same client before updating state
      if (currentClientRef.current !== client) {
        console.log(`Client changed during all tabs fetch: was ${client}, now ${currentClientRef.current}. Aborting data update.`);
        return;
      }
      
      // Update the items state with all the fetched data
      setItems(allTabsData);
      
      // Log summary counts for debugging
      const totalCounts = {
        keywords: { 
          total: allTabsData.keywords.length,
          approved: allTabsData.keywords.filter(item => item.status === 'approved').length,
          pending: allTabsData.keywords.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        briefs: { 
          total: allTabsData.briefs.length,
          approved: allTabsData.briefs.filter(item => item.status === 'approved').length,
          pending: allTabsData.briefs.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        articles: { 
          total: allTabsData.articles.length,
          approved: allTabsData.articles.filter(item => item.status === 'approved').length,
          pending: allTabsData.articles.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        backlinks: { 
          total: allTabsData.backlinks.length,
          approved: allTabsData.backlinks.filter(item => item.status === 'approved').length,
          pending: allTabsData.backlinks.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        quickwins: { 
          total: allTabsData.quickwins.length,
          approved: allTabsData.quickwins.filter(item => item.status === 'approved').length,
          pending: allTabsData.quickwins.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        youtubetopics: { 
          total: allTabsData.youtubetopics.length,
          approved: allTabsData.youtubetopics.filter(item => item.status === 'approved').length,
          pending: allTabsData.youtubetopics.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        youtubethumbnails: { 
          total: allTabsData.youtubethumbnails.length,
          approved: allTabsData.youtubethumbnails.filter(item => item.status === 'approved').length,
          pending: allTabsData.youtubethumbnails.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        },
        redditthreads: { 
          total: allTabsData.redditthreads.length,
          approved: allTabsData.redditthreads.filter(item => item.status === 'approved').length,
          pending: allTabsData.redditthreads.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length
        }
      };
      
      console.log('All tabs data loaded with counts:', totalCounts);
      
      // Update loading states
      setLoadingStatus(null);
      setInitialLoadComplete(true);
      setAllTabsDataLoaded(true);
      
      // First turn off the main loading state
      setIsLoading(false);
      
      // Then after a short delay, turn off the summary loading state
      // This prevents the flash of showing partial data in the summary
      setTimeout(() => {
        setIsSummaryLoading(false);
        console.log('Summary components now showing complete data');
      }, 50);
      
      console.log('All tabs data loaded successfully');
    } catch (error) {
      console.error('Error fetching all tabs data:', error);
      setLoadingStatus('Error fetching data. Please try again later.');
      setIsLoading(false);
      setIsSummaryLoading(false);
      setAllTabsDataLoaded(false);
    }
  // Remove allTabsDataLoaded from dependency array to prevent circular updates
  }, [clientId, isClientLoading]);

  // First effect - only runs on client change
  // Reset data when client changes
  useEffect(() => {
    console.log(`Client ID changed to: ${clientId} (isLoading: ${isClientLoading})`);
    
    // Update the current client ref
    currentClientRef.current = clientId;
    
    // If we're still loading client data, wait
    if (isClientLoading) {
      console.log('Client data still loading, waiting before resetting data');
      return;
    }
    
    // CRITICAL: CLEAR ALL DATA IMMEDIATELY when client changes to prevent showing wrong data
    console.log('CRITICAL: Client changed - clearing all approval data immediately');
    
    // Set loading state to true first to show loading UI while data clears
    setIsLoading(true);
    
    // Clear all data before fetching new data
    setItems({
      keywords: [],
      briefs: [],
      articles: [],
      backlinks: [],
      quickwins: [],
      youtubetopics: [],
      youtubethumbnails: [],
      redditthreads: []
    });
    
    // Reset pagination
    setStatusPagination(prev => {
      const newPagination = { ...prev };
      Object.keys(newPagination).forEach(status => {
        newPagination[status] = { ...defaultPagination };
      });
      return newPagination;
    });
    
    // Reset selections
    clearSelections();
    
    // Clear all caches immediately (both client and server side)
    console.log('Client changed, clearing all approvals cache');
    clearApprovalsCache().then(() => {
      console.log('All caches cleared, ready to fetch new data');
      
      // Only set initialLoadComplete to false after cache clearing is done
      setInitialLoadComplete(false);
      
      // Mark client as initialized
      clientInitializedRef.current = true;
      
      // Fetch data for all tabs when client changes
      fetchAllTabsData(true);
    });
    
  }, [clientId, isClientLoading, clearSelections, defaultPagination, fetchAllTabsData]);

  // Handle page change for a specific status table
  const handleStatusPageChange = async (status: string, newPage: number) => {
    try {
      // Check if we're already on this page - if so, don't update state
      if (statusPagination[status] && statusPagination[status].currentPage === newPage) {
        console.log(`Already on page ${newPage} for ${status}, no state update needed`);
        return;
      }
      
      // Update pagination state immediately to show the new page
      setStatusPagination(prev => ({
        ...prev,
        [status]: {
          ...prev[status],
          currentPage: newPage,
          hasPrevPage: newPage > 1,
        }
      }));
      
      setLoadingStatus(null);
    } catch (error) {
      console.error(`Error changing page for ${status}:`, error);
      setLoadingStatus(`Error loading page ${newPage} for ${status} items.`);
    } finally {
      setLoadingStatus(null);
    }
  };

  // Use ref to track which statuses have been updated to prevent infinite loops
  const updatedStatuses = useRef<Set<string>>(new Set());
  
  // Reset updated statuses when groupedItems changes (e.g., when tab changes)
  useEffect(() => {
    updatedStatuses.current = new Set();
  }, [activeTab]);

  // Second effect - runs on tab change or after client is initialized
  // Wait for client context to be ready before initial fetch
  useEffect(() => {
    // Track if component is mounted
    let isMounted = true;
    
    // Only proceed if client data is loaded, we have a valid clientId, and there's no data for this tab yet
    if (!isClientLoading && isMounted && clientId !== undefined && items[activeTab as keyof typeof items].length === 0 && !initialLoadComplete) {
      console.log(`Need to load data for ${activeTab} tab, items count: ${items[activeTab as keyof typeof items].length}`);
      
      // Mark client as initialized if not already
      if (!clientInitializedRef.current) {
        clientInitializedRef.current = true;
        console.log('Client context initialized for the first time');
      }
      
      // Reset pagination for all statuses
      setStatusPagination(prev => {
        const newPagination = { ...prev };
        Object.keys(newPagination).forEach(status => {
          newPagination[status] = { ...defaultPagination };
        });
        return newPagination;
      });

      // Clear selections when changing tabs or client
      clearSelections();

      // IMPORTANT: Set loading state BEFORE clearing data to prevent flash of old data
      setIsLoading(true);
      
      // Only clear the current tab's items, not all tabs
      setItems(prev => ({
        ...prev,
        [activeTab]: []
      }));
      
      // Fetch data for this tab if needed
      console.log(`Initiating data fetch for ${activeTab} with client ${clientId}`);
      fetchData(1, undefined, false).catch(error => {
        if (isMounted) {
          console.error(`Error in tab data fetch: ${error}`);
          setIsLoading(false);
          setLoadingStatus('Error fetching data. Please try again.');
        }
      });
    } else if (!isClientLoading && isMounted && clientId !== undefined && items[activeTab as keyof typeof items].length > 0) {
      console.log(`Tab ${activeTab} already has ${items[activeTab as keyof typeof items].length} items, no need to fetch`);
    } else {
      console.log(`Waiting for conditions: isClientLoading=${isClientLoading}, clientId=${clientId}, items count=${items[activeTab as keyof typeof items].length}, initialLoadComplete=${initialLoadComplete}`);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
    
    // Removing 'items' from the dependency array to prevent infinite loops
    // We're checking items.length inside the effect, but we don't want to re-run 
    // the effect every time items changes, only when tab or client changes
  }, [activeTab, clientId, isClientLoading, fetchData, defaultPagination, clearSelections, initialLoadComplete]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    console.log(`Changing tab from ${activeTab} to ${tab}`);
    
    // Only proceed if we're switching to a different tab (not re-clicking the same tab)
    if (tab !== activeTab) {
      console.log(`Switching to ${tab} tab`);
      
      // Keep the summary loading state active during tab change to prevent showing partial data
      setIsSummaryLoading(true);
      
      // Update the active tab
      setActiveTab(tab);
      
      // Reset selected items for the new tab
      setSelectedItems(prev => ({
        ...prev,
        [tab]: []
      }));
      
      // No need to fetch data again if we already have it
      console.log(`${tab} tab data count: ${items[tab as keyof typeof items].length} items`);
      
      // Only if we don't have any data for this tab (which should be rare since fetchAllTabsData 
      // should have loaded all tabs), then we'll set initialLoadComplete to false to trigger the useEffect
      if (items[tab as keyof typeof items].length === 0) {
        console.log(`No data found for ${tab} tab, will fetch data...`);
        setInitialLoadComplete(false);
      } else {
        console.log(`Using existing data for ${tab} tab, no need to fetch again`);
        
        // If we already have data for this tab, we can turn off the summary loading after a short delay
        // This delay ensures that the UI has time to update with the new tab data
        setTimeout(() => {
          setIsSummaryLoading(false);
          console.log('Tab change complete, summary components now showing complete data');
        }, 50);
      }
    } else {
      console.log(`Re-clicked the same tab (${tab}), not doing anything`);
    }
  };

  // Calculate counts for pending items in each category
  const pendingCounts = {
    keywords: items.keywords.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    briefs: items.briefs.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    articles: items.articles.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    backlinks: items.backlinks.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    quickwins: items.quickwins.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    youtubetopics: items.youtubetopics.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    youtubethumbnails: items.youtubethumbnails.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    redditthreads: items.redditthreads.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
  };

  // Calculate total approved and pending items
  const totalApproved = Object.keys(items).reduce((sum, key) => {
    return sum + items[key as keyof typeof items].filter(item => item.status === 'approved').length;
  }, 0);
  
  const totalPending = Object.values(pendingCounts).reduce((sum, count) => sum + count, 0);
  
  // Log the counts for debugging
  console.log('Total counts across all tabs:', {
    keywords: { pending: pendingCounts.keywords, approved: items.keywords.filter(item => item.status === 'approved').length, total: items.keywords.length },
    briefs: { pending: pendingCounts.briefs, approved: items.briefs.filter(item => item.status === 'approved').length, total: items.briefs.length },
    articles: { pending: pendingCounts.articles, approved: items.articles.filter(item => item.status === 'approved').length, total: items.articles.length },
    backlinks: { pending: pendingCounts.backlinks, approved: items.backlinks.filter(item => item.status === 'approved').length, total: items.backlinks.length },
    quickwins: { pending: pendingCounts.quickwins, approved: items.quickwins.filter(item => item.status === 'approved').length, total: items.quickwins.length },
    youtubetopics: { pending: pendingCounts.youtubetopics, approved: items.youtubetopics.filter(item => item.status === 'approved').length, total: items.youtubetopics.length },
    youtubethumbnails: { pending: pendingCounts.youtubethumbnails, approved: items.youtubethumbnails.filter(item => item.status === 'approved').length, total: items.youtubethumbnails.length },
    redditthreads: { pending: pendingCounts.redditthreads, approved: items.redditthreads.filter(item => item.status === 'approved').length, total: items.redditthreads.length },
    totalApproved,
    totalPending,
    totalItems: totalApproved + totalPending
  });

  // Group items by status
  const groupedItems: GroupedItems = {
    not_started: items[activeTab as keyof typeof items].filter(item => item.status === 'not_started'),
    in_progress: items[activeTab as keyof typeof items].filter(item => item.status === 'in_progress'),
    ready_for_review: items[activeTab as keyof typeof items].filter(item => item.status === 'ready_for_review'),
    awaiting_approval: items[activeTab as keyof typeof items].filter(item => item.status === 'awaiting_approval'),
    revisions_needed: items[activeTab as keyof typeof items].filter(item => item.status === 'revisions_needed'),
    approved: items[activeTab as keyof typeof items].filter(item => item.status === 'approved'),
    published: items[activeTab as keyof typeof items].filter(item => item.status === 'published'),
    // Legacy statuses for backward compatibility
    resubmitted: items[activeTab as keyof typeof items].filter(item => item.status === 'resubmitted'),
    needs_revision: items[activeTab as keyof typeof items].filter(item => item.status === 'needs_revision'),
    rejected: items[activeTab as keyof typeof items].filter(item => item.status === 'rejected'),
  };

  // Get count of items to review in current tab
  const tabReviewCount = items[activeTab as keyof typeof items].filter(
    item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)
  ).length;

  const handleApprove = async (id: string) => {
    try {
      // Get the current client for debugging
      const currentClient = clientId === null || clientId === 'all' ? 'all' : clientId;
      console.log(`Approving item ${id} with client filter: ${currentClient}`);
      
      // Make sure we use the correct status value
      const airtableStatus = 'Approved';
      
      // Clear cache before update to ensure fresh data after
      console.log('Clearing cache before approval update');
      clearApprovalsCache(); // Clear all types to be safe
      
      // Call the API to update Airtable
      const result = await updateApprovalStatus(activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks' | 'quickwins' | 'youtubetopics' | 'youtubethumbnails', id, airtableStatus);
      console.log('Update approval result:', result);

      // Update local state
      setItems(prev => {
        const newItems = { ...prev };
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === id);

        if (itemIndex !== -1) {
          console.log(`Updating local state for item ${id} from ${newItems[activeTab as keyof typeof items][itemIndex].status} to approved`);
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'approved', // Local state can remain 'approved' for UI consistency
            dateApproved: formatDate(new Date().toISOString())
          };
        } else {
          console.warn(`Item ${id} not found in local state for update`);
        }

        return newItems;
      });
      
      // Refresh data after a short delay to ensure we get the latest from Airtable
      setTimeout(() => {
        console.log('Refreshing all tabs data after approval update');
        fetchAllTabsData(true); // Force refresh all tabs data
      }, 1000);
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleRequestChanges = (id: string) => {
    setRejectionModal({ isOpen: true, itemId: id });
  };

  // Handle selecting/deselecting a single item
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const currentTab = activeTab as keyof typeof prev;
      const newSelectedItems = { ...prev };

      if (newSelectedItems[currentTab].includes(id)) {
        // Remove item if already selected
        newSelectedItems[currentTab] = newSelectedItems[currentTab].filter(itemId => itemId !== id);
      } else {
        // Add item if not selected
        newSelectedItems[currentTab] = [...newSelectedItems[currentTab], id];
      }

      return newSelectedItems;
    });
  };

  // Handle selecting/deselecting all items in a status group
  const toggleGroupSelection = (statusItems: ApprovalItem[], isSelected: boolean) => {
    setSelectedItems(prev => {
      const currentTab = activeTab as keyof typeof prev;
      const newSelectedItems = { ...prev };

      if (isSelected) {
        // Add all items from this status group that aren't already selected
        const itemIds = statusItems.map(item => item.id);
        const uniqueIds = [...new Set([...newSelectedItems[currentTab], ...itemIds])];
        newSelectedItems[currentTab] = uniqueIds;
      } else {
        // Remove all items from this status group
        const itemIds = statusItems.map(item => item.id);
        newSelectedItems[currentTab] = newSelectedItems[currentTab].filter(id => !itemIds.includes(id));
      }

      return newSelectedItems;
    });
  };

  // Check if all items in a group are selected
  const areAllItemsSelected = (statusItems: ApprovalItem[]) => {
    if (statusItems.length === 0) return false;

    const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];
    return statusItems.every(item => currentTabSelections.includes(item.id));
  };

  // Get count of selected items that can be approved
  const getSelectedApprovableCount = () => {
    const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];
    const approvableItems = items[activeTab as keyof typeof items].filter(
      item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status) && currentTabSelections.includes(item.id)
    );
    return approvableItems.length;
  };

  // Approve selected items
  const approveSelectedItems = async () => {
    const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];
    
    // Get the current client for debugging
    const currentClient = clientId === null || clientId === 'all' ? 'all' : clientId;
    console.log(`Bulk approving ${currentTabSelections.length} items with client filter: ${currentClient}`);

    // Clear cache before update to ensure fresh data after
    console.log('Clearing cache before bulk approval update');
    clearApprovalsCache(); // Clear all types to be safe

    // Process each selected item
    for (const id of currentTabSelections) {
      try {
        // Always use 'Approved' as the status value
        const airtableStatus = 'Approved';
        console.log(`Approving item ${id} in ${activeTab}`);
        
        const result = await updateApprovalStatus(
          activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks' | 'quickwins' | 'youtubetopics' | 'youtubethumbnails', 
          id, 
          airtableStatus
        );
        console.log(`Approval result for item ${id}:`, result);
      } catch (error) {
        console.error(`Error approving item ${id}:`, error);
      }
    }

    // Update local state
    setItems(prev => {
      const newItems = { ...prev };

      currentTabSelections.forEach(id => {
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === id);

        if (itemIndex !== -1 && ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(newItems[activeTab as keyof typeof items][itemIndex].status)) {
          console.log(`Updating local state for item ${id} from ${newItems[activeTab as keyof typeof items][itemIndex].status} to approved`);
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'approved', // Local state can remain 'approved' for UI consistency
            dateApproved: formatDate(new Date().toISOString())
          };
        }
      });

      return newItems;
    });

    // Clear selections after approving
    clearSelections();
    
    // Refresh data after a short delay to ensure we get the latest from Airtable
    setTimeout(() => {
      console.log('Refreshing all tabs data after bulk approval update');
      fetchAllTabsData(true); // Force refresh all tabs data
    }, 1000);
  };

  const confirmRequestChanges = async (reason: string) => {
    // Check if this is a bulk action
    const isBulkAction = rejectionModal.itemId === 'bulk';
    
    // Get the current client for debugging
    const currentClient = clientId === null || clientId === 'all' ? 'all' : clientId;
    console.log(`${isBulkAction ? 'Bulk requesting' : 'Requesting'} changes with client filter: ${currentClient}`);

    // Clear cache before update to ensure fresh data after
    console.log('Clearing cache before requesting changes');
    clearApprovalsCache(); // Clear all types to be safe

    if (isBulkAction) {
      // Get the selected items for the current tab
      const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];
      console.log(`Requesting changes for ${currentTabSelections.length} items`);

      // Process each selected item
      for (const id of currentTabSelections) {
        try {
          // Always use 'Needs Revision' as the status value
          const result = await updateApprovalStatus(
            activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks' | 'quickwins' | 'youtubetopics' | 'youtubethumbnails',
            id, 
            'Needs Revision', 
            reason
          );
          console.log(`Revision request result for item ${id}:`, result);
        } catch (error) {
          console.error(`Error requesting changes for item ${id}:`, error);
        }
      }
    } else {
      // Update a single item
      try {
        console.log(`Requesting changes for single item ${rejectionModal.itemId}`);
        const result = await updateApprovalStatus(
          activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks',
          rejectionModal.itemId, 
          'Needs Revision', 
          reason
        );
        console.log(`Revision request result:`, result);
      } catch (error) {
        console.error(`Error requesting changes for item ${rejectionModal.itemId}:`, error);
      }
    }

    // Update local state after all successful (or attempted) API calls
    setItems(prev => {
      const newItems = { ...prev };

      if (isBulkAction) {
        // Get the selected items for the current tab
        const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];

        // Update only selected pending items in the current tab
        newItems[activeTab as keyof typeof items] = newItems[activeTab as keyof typeof items].map(item => {
          if (['awaiting_approval', 'resubmitted', 'needs_revision', 'ready_for_review'].includes(item.status) && currentTabSelections.includes(item.id)) {
            console.log(`Updating local state for item ${item.id} from ${item.status} to revisions_needed`);
            return {
              ...item,
              status: 'revisions_needed',
              dateApproved: formatDate(new Date().toISOString()),
              revisionReason: reason
            };
          }
          return item;
        });
      } else {
        // Update a single item
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === rejectionModal.itemId);

        if (itemIndex !== -1) {
          console.log(`Updating local state for item ${rejectionModal.itemId} from ${newItems[activeTab as keyof typeof items][itemIndex].status} to revisions_needed`);
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'revisions_needed',
            dateApproved: formatDate(new Date().toISOString()),
            revisionReason: reason
          };
        } else {
          console.warn(`Item ${rejectionModal.itemId} not found in local state for update`);
        }
      }

      return newItems;
    });

    // Clear selections after applying changes
    clearSelections();
    setRejectionModal({ isOpen: false, itemId: '' });
    
    // Refresh data after a short delay to ensure we get the latest from Airtable
    setTimeout(() => {
      console.log('Refreshing all tabs data after requesting changes');
      fetchAllTabsData(true); // Force refresh all tabs data
    }, 1000);
  };

  return (
    <DashboardLayout>
      {/* Add custom styles */}
      <style jsx global>{tabStyles}</style>
      
      {/* Global Summary Banner */}
      <GlobalSummaryBanner
        counts={pendingCounts}
        isLoading={isSummaryLoading || isClientLoading}
        clientId={clientId}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {/* Tab Navigation */}
          <PageContainer className="relative z-10">
            <PageContainerTabs className="w-full border-b border-gray-200">
              <div className="w-full">
                <TabNavigation
                  tabs={[
                    { id: 'keywords', label: 'Keywords', icon: <TrendingUp size={16} /> },
                    { id: 'briefs', label: 'Briefs', icon: <FileText size={16} /> },
                    { id: 'articles', label: 'Articles', icon: <BookOpen size={16} /> },
                    { id: 'backlinks', label: 'Backlinks', icon: <Link2 size={16} /> },
                    { id: 'quickwins', label: 'Quick Wins', icon: <Zap size={16} /> },
                    { id: 'youtubetopics', label: 'YT Topics', icon: <Award size={16} /> },
                    { id: 'youtubethumbnails', label: 'YT Thumbnails', icon: <BarChart2 size={16} /> },
                    { id: 'redditthreads', label: 'Reddit Threads', icon: <ExternalLink size={16} /> }
                  ]}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  variant="primary"
                  containerClassName="flex flex-wrap w-full"
                />
              </div>
            </PageContainerTabs>
            <PageContainerBody>
              {/* Bulk action buttons */}
              <div className="mb-4 flex justify-end">
                {!isClientLoading && tabReviewCount > 0 && (
                  <div className="flex space-x-3">
                    <button
                      onClick={approveSelectedItems}
                      disabled={getSelectedApprovableCount() === 0}
                      className={`px-4 py-1 text-base font-medium rounded-md transition-colors ${
                        getSelectedApprovableCount() > 0
                          ? 'bg-gray-100 text-[#353233] hover:bg-gray-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {getSelectedApprovableCount() > 0
                        ? `Approve Selected (${getSelectedApprovableCount()})`
                        : 'Select Items to Approve'}
                    </button>
                    <button
                      onClick={() => {
                        if (getSelectedApprovableCount() > 0) {
                          setRejectionModal({ isOpen: true, itemId: 'bulk' });
                        }
                      }}
                      disabled={getSelectedApprovableCount() === 0}
                      className={`px-4 py-1 text-base font-medium rounded-md transition-colors ${
                        getSelectedApprovableCount() > 0
                          ? 'text-[#353233] border border-[#D9D9D9] hover:bg-gray-100'
                          : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Revisions Needed
                    </button>
                    {selectedItems[activeTab as keyof typeof selectedItems].length > 0 && (
                      <button
                        onClick={clearSelections}
                        className="px-4 py-1 text-base font-medium text-[#353233] border border-[#D9D9D9] rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Table View */}
              <div className="overflow-hidden">
                {isLoading || isClientLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9EA8FB] mb-4"></div>
                    <p className="text-gray-600 text-base font-medium">Loading...</p>
                  </div>
                ) : !initialLoadComplete ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9EA8FB] mb-4"></div>
                    <p className="text-gray-600 text-base font-medium">Loading...</p>
                  </div>
                ) : Object.values(groupedItems).some(items => items.length > 0) ? (
                  <>
                    <ApprovalTable
                      groupedItems={groupedItems}
                      onApprove={handleApprove}
                      onRequestChanges={handleRequestChanges}
                      selectedItems={selectedItems[activeTab as keyof typeof selectedItems]}
                      onToggleItemSelection={toggleItemSelection}
                      onToggleGroupSelection={toggleGroupSelection}
                      areAllItemsSelected={areAllItemsSelected}
                      statusPagination={statusPagination}
                      onStatusPageChange={handleStatusPageChange}
                      activeTab={activeTab}
                      loadingStatus={loadingStatus}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                    {clientId && clientId !== 'all' ? (
                      <div>
                        <p className="text-gray-500 py-2 text-base">No items found for the selected client.</p>
                        <p className="text-gray-400 text-sm">Try selecting a different client from the dropdown in the top navigation bar.</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 py-4 text-base">No items found in this section.</p>
                    )}
                  </div>
                )}
              </div>
            </PageContainerBody>
          </PageContainer>
        </div>

        {/* Sidebar Summary Panel (Desktop Only) */}
        <div className="hidden lg:block w-64">
          <SidebarSummaryPanel
            counts={pendingCounts}
            totalApproved={totalApproved}
            totalPending={totalPending}
            isLoading={isSummaryLoading || isClientLoading}
            clientId={clientId}
          />
        </div>
      </div>

      {/* Rejection/Request Changes Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, itemId: '' })}
        onConfirm={confirmRequestChanges}
      />
    </DashboardLayout>
  );
}

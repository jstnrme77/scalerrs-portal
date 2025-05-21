'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
// import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { FileText, BookOpen, Link2, MessageCircle, ExternalLink, Award, Zap, BarChart2, TrendingUp } from 'lucide-react';
import { fetchApprovalItems, updateApprovalStatus, clearApprovalsCache } from '@/lib/client-api-utils';
import Pagination from '@/components/ui/Pagination';
import { useClientData } from '@/context/ClientDataContext';

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
    <div className="p-6 rounded-lg mb-6 border-8 border-[#9EA8FB] bg-[#9EA8FB]/10 shadow-sm">
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
              You have {totalCount} items awaiting your review {clientText} across {categoriesCount} categories
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

  // Get client-specific title
  const clientText = clientId && clientId !== 'all' ? 'Client' : 'All Clients';
  const title = isLoading ? 'Loading...' : `Pending Approvals (${clientText})`;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
              <span className="text-lg font-bold text-dark">{totalApproved} <span className="text-sm font-normal mx-1">of</span> {totalApproved + totalPending}</span>
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
              <span className="text-dark">Keyword</span>
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
              <div className="flex justify-between py-2">
                <span className="text-dark">Quick Wins</span>
                <span className="font-medium text-dark">{counts.quickwins}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Import the ConversationHistoryModal
import { ConversationHistoryModal } from '@/components/ui/modals';

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

  // Function to open conversation modal - with safety check for allowed content types
  const openConversationModal = (itemId: string, itemTitle: string) => {
    // Only allow opening the modal for Keywords and Briefs tabs
    if (activeTab === 'keywords' || activeTab === 'briefs') {
      setConversationModal({
        isOpen: true,
        itemId,
        itemTitle
      });
    } else {
      console.log(`Conversation history not available for ${activeTab} tab`);
    }
  };
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

    // If we're on a page that doesn't have any items but we're not loading,
    // show a message instead of redirecting
    if (items.length === 0 && pagination.currentPage > 1 && loadingStatus !== status) {
      console.log(`No items found for ${status} on page ${pagination.currentPage}`);
    }

    // Check if all items in this group are selected
    const allSelected = areAllItemsSelected(items);

    // Always show checkbox column for consistent layout, but only make them interactive for actionable items
    const showInteractiveCheckboxes = ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(status);

    // Define table styles without outside border
    const tableBorderClass = "overflow-hidden";
    const tableHeaderClass = "bg-gray-50";

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
            <div className={tableBorderClass}>
              <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead className={tableHeaderClass}>
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <div className="flex items-center justify-center">
                        {/* Always show checkbox for header alignment, but only make it interactive when needed */}
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
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '35%' }}>Deliverable</th>
                    <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '15%' }}>
                      {activeTab === 'articles' ? 'Writer' : 'Assigned To'}
                    </th>
                    <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '15%' }}>Last Updated</th>
                    <th className="px-4 py-3 text-center text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '10%' }}>Status</th>
                    <th className="px-4 py-3 text-right text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '25%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item: ApprovalItem) => {
                    // Check if this item is selected
                    const isSelected = selectedItems.includes(item.id);

                    // Add selected styling
                    const selectedClass = isSelected ? 'bg-gray-50' : '';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 ${selectedClass}`}
                      >
                        <td className="px-4 py-3 w-12">
                          <div className="flex items-center justify-center">
                            {/* Always show checkbox for alignment, but only make it interactive when needed */}
                            {showInteractiveCheckboxes ? (
                              <input
                                type="checkbox"
                                className="h-5 w-5 text-gray-600 focus:ring-gray-500 border border-gray-300 rounded cursor-pointer"
                                checked={isSelected}
                                onChange={() => onToggleItemSelection(item.id)}
                              />
                            ) : (
                              <div className="h-5 w-5"></div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ width: '35%' }}>
                          <div className="flex items-start">
                            <div>
                              <div className="text-base font-medium text-dark">
                                {activeTab === 'briefs' && item.documentLink ? (
                                  <a
                                    href={item.documentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary hover:underline flex items-center"
                                  >
                                    {item.item}
                                    <ExternalLink size={14} className="ml-1 inline-block" />
                                  </a>
                                ) : activeTab === 'articles' && item.documentLink ? (
                                  <a
                                    href={item.documentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary hover:underline flex items-center"
                                  >
                                    {item.item}
                                    <ExternalLink size={14} className="ml-1 inline-block" />
                                  </a>
                                ) : (
                                  <a href="#" className="hover:text-primary hover:underline">{item.item}</a>
                                )}
                              </div>
                              {'type' in item && <div className="text-base text-mediumGray">{item.type}</div>}
                              {'wordCount' in item && <div className="text-base text-mediumGray">{item.wordCount} words</div>}
                              {'volume' in item && <div className="text-base text-mediumGray">Volume: {item.volume}</div>}
                              {'count' in item && <div className="text-base text-mediumGray">{item.count} links</div>}
                              {'pages' in item && <div className="text-base text-mediumGray">{item.pages} pages</div>}

                              {/* Additional fields for Backlinks */}
                              {activeTab === 'backlinks' && (
                                <>
                                  {item.domainRating !== undefined && (
                                    <div className="text-base text-mediumGray">Domain Rating: {item.domainRating}</div>
                                  )}
                                  {item.linkType && (
                                    <div className="text-base text-mediumGray">Link Type: {item.linkType}</div>
                                  )}
                                  {item.targetPage && (
                                    <div className="text-base text-mediumGray">
                                      Target:
                                      <a
                                        href={String(item.targetPage)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-primary hover:underline"
                                      >
                                        {String(item.targetPage).replace(/^https?:\/\//, '').substring(0, 30)}
                                        {String(item.targetPage).length > 30 ? '...' : ''}
                                        <ExternalLink size={12} className="ml-1 inline-block" />
                                      </a>
                                    </div>
                                  )}
                                  {item.wentLiveOn && (
                                    <div className="text-base text-mediumGray">Live Date: {String(item.wentLiveOn)}</div>
                                  )}
                                  {item.notes && (
                                    <div className="text-base text-mediumGray">Notes: {String(item.notes)}</div>
                                  )}
                                </>
                              )}

                              {/* Quick Wins resource links */}
                              {activeTab === 'quickwins' && item.resourceLink && (
                                <div className="text-base text-mediumGray mt-1">
                                  <a
                                    href={item.resourceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center"
                                  >
                                    View Resource
                                    <ExternalLink size={14} className="ml-1 inline-block" />
                                  </a>
                                </div>
                              )}

                              {item.revisionReason && (
                                <div className="text-base text-gray-700 mt-1 bg-gray-50 p-1 rounded border border-gray-200">
                                  <span className="font-medium">Revision: </span>{item.revisionReason}
                                </div>
                              )}

                              {/* Comments section - only show for Keywords and Briefs tabs */}
                              {(activeTab === 'keywords' || activeTab === 'briefs') && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => openConversationModal(item.id, item.item)}
                                    className="flex items-center text-sm text-primary hover:underline"
                                  >
                                    <MessageCircle size={14} className="mr-1" />
                                    View Conversation History
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ width: '15%' }}>
                          <div className="text-base text-dark">
                            {activeTab === 'articles' ? (
                              // For Articles, show "Writer" instead of "Assigned to"
                              (() => {
                                if (!item.writer && !item.strategist) return 'Unassigned';
                                if (typeof item.writer === 'string') return item.writer;
                                
                                // Handle writer as object or array
                                if (item.writer) {
                                  if (Array.isArray(item.writer)) {
                                    return item.writer.map(w => w.name).join(', ') || 'Unknown Writer';
                                  }
                                  return item.writer.name || 'Unknown Writer';
                                }
                                
                                // Fall back to strategist
                                if (typeof item.strategist === 'string') return item.strategist;
                                if (Array.isArray(item.strategist)) {
                                  return item.strategist.map(s => s.name).join(', ') || 'Unknown Strategist';
                                }
                                return item.strategist?.name || 'Unknown Strategist';
                              })()
                            ) : (
                              (() => {
                                if (!item.strategist) return 'Unassigned';
                                if (typeof item.strategist === 'string') return item.strategist;
                                if (Array.isArray(item.strategist)) {
                                  return item.strategist.map(s => s.name).join(', ') || 'Unknown Strategist';
                                }
                                return item.strategist.name || 'Unknown Strategist';
                              })()
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ width: '15%' }}>
                          <div className="text-base text-mediumGray">{item.lastUpdated}</div>
                        </td>
                        <td className="px-4 py-3 text-center" style={{ width: '10%' }}>
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-right" style={{ width: '25%' }}>
                          {(['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)) && (
                            <div className="flex justify-end space-x-2">
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
                                Revisions Needed
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => onStatusPageChange(status, page)}
                    hasNextPage={pagination.currentPage < pagination.totalPages}
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

      {/* Conversation History Modal - only render for Keywords and Briefs tabs */}
      {(activeTab === 'keywords' || activeTab === 'briefs') && (
        <ConversationHistoryModal
          isOpen={conversationModal.isOpen}
          onClose={() => setConversationModal({ isOpen: false, itemId: '', itemTitle: '' })}
          itemId={conversationModal.itemId}
          itemTitle={conversationModal.itemTitle}
          contentType={activeTab as 'keywords' | 'briefs'}
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
  // Backlinks specific fields
  domainRating?: number;
  linkType?: string;
  targetPage?: string;
  wentLiveOn?: string;
  notes?: string;
  // Legacy fields
  keywordUplift?: string | number;
  currentPosition?: string | number;
  pageType?: string;
  keywordScore?: string | number;
  comments?: Array<{ id: string; text: string; author?: string; timestamp?: string }>;
}

// Define the type for the items state
interface ApprovalItems {
  keywords: ApprovalItem[];
  briefs: ApprovalItem[];
  articles: ApprovalItem[];
  backlinks: ApprovalItem[];
  quickwins: ApprovalItem[];
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
  const { clientId } = useClientData();

  // Debug log for client ID changes and refresh data
  useEffect(() => {
    console.log('Approvals page - clientId changed:', clientId);

    // Force refresh data when client ID changes
    if (clientId) {
      console.log('Forcing data refresh due to client ID change');
      // We'll handle this in the other useEffect that depends on clientId
    }
  }, [clientId]);
  const [activeTab, setActiveTab] = useState<string>('briefs');
  const [items, setItems] = useState<ApprovalItems>({
    keywords: [],
    briefs: [],
    articles: [],
    backlinks: [],
    quickwins: []
  });
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, itemId: '' });
  const [selectedItems, setSelectedItems] = useState<{[key: string]: string[]}>({
    keywords: [],
    briefs: [],
    articles: [],
    backlinks: [],
    quickwins: []
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

  // We no longer need main pagination since we're using status-specific pagination

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  // Fetch data from Airtable when component mounts or tab changes
  const fetchData = useCallback(async (page: number = 1, offset?: string, forceRefresh: boolean = false) => {
    setIsLoading(true);

    try {
      console.log(`Fetching ${activeTab} data with:`, { page, offset, forceRefresh, clientId });

      // Clear cache when forcing refresh (especially when client changes)
      if (forceRefresh) {
        console.log('Clearing approvals cache due to force refresh');
        clearApprovalsCache(activeTab);
      }

      // Fetch data for the active tab
      if (activeTab === 'keywords' || activeTab === 'briefs' || activeTab === 'articles' || activeTab === 'backlinks') {
        console.log(`Calling fetchApprovalItems for ${activeTab}...`);

        try {
          // Use the updated fetchApprovalItems function with pagination and caching
          // Pass the clientId explicitly to the API
          const result = await fetchApprovalItems(
            activeTab,
            page,
            100, // Fetch more items at once to ensure we have enough for pagination
            offset,
            undefined, // No abort signal
            !forceRefresh, // Use cache unless forceRefresh is true
            clientId || 'all' // Always pass clientId, defaulting to 'all' if null
          );

          console.log(`Result from fetchApprovalItems for ${activeTab}:`, result);

          // Check if we got any results
          if (result.items) {
            console.log(`Found ${result.items.length} items for ${activeTab}`);

            // Update the items state with the fetched data
            setItems(prev => {
              const newItems = {
                ...prev,
                [activeTab]: result.items
              };
              return newItems;
            });

            // We no longer need to update main pagination since we're using status-specific pagination

            // Group items by status
            const itemsByStatus: GroupedItems = {
              not_started: result.items.filter(item => item.status === 'not_started'),
              in_progress: result.items.filter(item => item.status === 'in_progress'),
              ready_for_review: result.items.filter(item => item.status === 'ready_for_review'),
              awaiting_approval: result.items.filter(item => item.status === 'awaiting_approval'),
              revisions_needed: result.items.filter(item => item.status === 'revisions_needed'),
              approved: result.items.filter(item => item.status === 'approved'),
              published: result.items.filter(item => item.status === 'published'),
              // Legacy statuses for backward compatibility
              resubmitted: result.items.filter(item => item.status === 'resubmitted'),
              needs_revision: result.items.filter(item => item.status === 'needs_revision'),
              rejected: result.items.filter(item => item.status === 'rejected'),
            };

            // Initialize pagination state for each status
            // We'll fetch data for each status separately when the user changes pages
            setStatusPagination(prev => {
              const newPagination = { ...prev };

              // For each status, calculate pagination based on filtered items
              (Object.keys(itemsByStatus) as Array<keyof GroupedItems>).forEach(status => {
                const statusItems = itemsByStatus[status];

                // Calculate pagination for this status
                const totalPages = Math.max(1, Math.ceil(statusItems.length / 5)); // 5 items per page for each status table

                newPagination[status] = {
                  currentPage: 1, // Always start at page 1
                  totalPages: totalPages,
                  totalItems: statusItems.length,
                  hasNextPage: statusItems.length > 5,
                  hasPrevPage: false, // Always false for page 1
                  nextOffset: statusItems.length > 5 ? '2' : null, // Next page is 2 if there are more items
                  prevOffset: null // No previous page for page 1
                };

                // Log pagination info for debugging
                console.log(`Initialized pagination for ${status}: ${statusItems.length} items, ${totalPages} pages`);
              });

              return newPagination;
            });
          } else {
            console.log(`No items found for ${activeTab}, using empty array`);

            // Use empty array instead of mock data
            setItems(prev => ({
              ...prev,
              [activeTab]: []
            }));

            // Reset pagination for all statuses
            setStatusPagination(prev => {
              const newPagination = { ...prev };
              Object.keys(newPagination).forEach(status => {
                newPagination[status] = { ...defaultPagination };
              });
              return newPagination;
            });
          }
        } catch (apiError) {
          console.error(`API error fetching ${activeTab} data:`, apiError);

          // If there's an API error, use empty array
          console.log(`Using empty array for ${activeTab} due to API error`);

          setItems(prev => ({
            ...prev,
            [activeTab]: []
          }));

          // Reset pagination for all statuses
          setStatusPagination(prev => {
            const newPagination = { ...prev };
            Object.keys(newPagination).forEach(status => {
              newPagination[status] = { ...defaultPagination };
            });
            return newPagination;
          });
        }
      }
    } catch (error) {
      console.error(`Error in fetchData for ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, clientId, defaultPagination]);

  // Handle page change for a specific status table
  const handleStatusPageChange = async (status: string, newPage: number) => {
    console.log(`Changing page for ${status} to ${newPage}`);

    // Update the pagination state for this status immediately to show the change
    setStatusPagination(prev => ({
      ...prev,
      [status]: {
        ...prev[status],
        currentPage: newPage
      }
    }));

    // Fetch new data for this status
    try {
      // Set loading state for this specific status
      setLoadingStatus(status);
      console.log(`Fetching ${activeTab} data for status ${status}, page ${newPage}`);

      // First, check if we need to fetch all items for this status
      // This ensures we have accurate pagination information
      const allItemsForStatus = items[activeTab as keyof typeof items].filter(item => item.status === status);

      // If we don't have enough items for this status, fetch more
      if (allItemsForStatus.length < newPage * 5) {
        console.log(`Not enough items for ${status} page ${newPage}, fetching more data...`);

        // Fetch all items for this status
        const result = await fetchApprovalItems(
          activeTab,
          1, // Start from page 1
          100, // Fetch more items at once
          undefined, // No offset
          undefined, // No abort signal
          false, // Don't use cache to ensure we get fresh data
          clientId || 'all', // Always pass clientId, defaulting to 'all' if null
          status // Pass the status
        );

        console.log(`Result from fetchApprovalItems for ${activeTab} status ${status}:`, result);

        if (result.items && result.items.length > 0) {
          // Make sure all items have the correct status
          const itemsWithCorrectStatus = result.items.map(item => ({
            ...item,
            status: status // Ensure the status is correct
          }));

          // Update the items for this status only
          setItems(prev => {
            const newItems = { ...prev };
            const currentItems = [...newItems[activeTab as keyof typeof items]];

            // Replace the items with this status with the new items
            const otherItems = currentItems.filter(item => item.status !== status);
            const updatedItems = [...otherItems, ...itemsWithCorrectStatus];

            newItems[activeTab as keyof typeof items] = updatedItems;
            return newItems;
          });

          // Update pagination state with the new information
          const totalItems = result.items.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / 5));

          setStatusPagination(prev => ({
            ...prev,
            [status]: {
              ...prev[status],
              currentPage: newPage > totalPages ? 1 : newPage, // If newPage is beyond totalPages, go to page 1
              totalPages: totalPages,
              totalItems: totalItems,
              hasNextPage: newPage < totalPages,
              hasPrevPage: newPage > 1
            }
          }));
        } else {
          console.log(`No items found for ${activeTab} with status ${status}`);

          // Update pagination to reflect that there are no items
          setStatusPagination(prev => ({
            ...prev,
            [status]: {
              ...prev[status],
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              hasNextPage: false,
              hasPrevPage: false
            }
          }));
        }
      } else {
        // We have enough items, just update the pagination state
        console.log(`Using existing items for ${status} page ${newPage}`);

        const totalItems = allItemsForStatus.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / 5));

        setStatusPagination(prev => ({
          ...prev,
          [status]: {
            ...prev[status],
            totalPages: totalPages,
            totalItems: totalItems,
            hasNextPage: newPage < totalPages,
            hasPrevPage: newPage > 1
          }
        }));
      }

      // Clear loading state
      setLoadingStatus(null);
    } catch (error) {
      console.error(`Error fetching ${activeTab} data for status ${status}:`, error);
      // Clear loading state
      setLoadingStatus(null);

      // Revert to previous page on error
      setStatusPagination(prev => ({
        ...prev,
        [status]: {
          ...prev[status],
          currentPage: Math.max(1, prev[status].currentPage - 1)
        }
      }));
    }

    console.log(`Changed page for ${status} to ${newPage}`);
  };

  // We no longer need the main pagination handler since we're using status-specific pagination

  // Clear all selections for the current tab
  const clearSelections = useCallback(() => {
    setSelectedItems(prev => {
      const newSelectedItems = { ...prev };
      newSelectedItems[activeTab as keyof typeof prev] = [];
      return newSelectedItems;
    });
  }, [activeTab]);

  // Fetch data when component mounts, tab changes, or client changes
  useEffect(() => {
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

    // Set loading state
    setIsLoading(true);

    // Add a small delay to ensure the loading state is visible
    const timer = setTimeout(() => {
      // Fetch first page of data with force refresh when client changes
      fetchData(1, undefined, true);
    }, 100);

    // Cleanup function to prevent state updates after unmount
    return () => {
      clearTimeout(timer);
    };
  }, [activeTab, clientId, fetchData, defaultPagination, clearSelections]);

  // Calculate counts for pending items in each category
  const pendingCounts = {
    keywords: items.keywords.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    briefs: items.briefs.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    articles: items.articles.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    backlinks: items.backlinks.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    quickwins: items.quickwins.filter(item => ['not_started', 'in_progress', 'ready_for_review', 'awaiting_approval', 'revisions_needed', 'resubmitted', 'needs_revision'].includes(item.status)).length,
  };

  // Calculate total approved and pending items
  const totalApproved = Object.values(items).flat().filter(item => item.status === 'approved').length;
  const totalPending = Object.values(pendingCounts).reduce((sum, count) => sum + count, 0);

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
      let airtableStatus = 'Brief Approved'; // Default status
      switch (activeTab) {
        case 'keywords':
          airtableStatus = 'Keyword Approvals';
          break;
        case 'briefs':
          airtableStatus = 'Brief Approvals';
          break;
        case 'articles':
          airtableStatus = 'Article Approvals';
          break;
        case 'backlinks':
          airtableStatus = 'Backlink Approvals'; // Assumed for consistency
          break;
      }
      await updateApprovalStatus(activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks', id, airtableStatus);

      // Update local state
      setItems(prev => {
        const newItems = { ...prev };
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === id);

        if (itemIndex !== -1) {
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'approved', // Local state can remain 'approved' for UI consistency
            dateApproved: new Date().toISOString().split('T')[0]
          };
        }

        return newItems;
      });
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

    // Process each selected item
    for (const id of currentTabSelections) {
      try {
        let airtableStatus = 'Brief Approved'; // Default status
        switch (activeTab) {
          case 'keywords':
            airtableStatus = 'Keyword Approvals';
            break;
          case 'briefs':
            airtableStatus = 'Brief Approvals';
            break;
          case 'articles':
            airtableStatus = 'Article Approvals';
            break;
          case 'backlinks':
            airtableStatus = 'Backlink Approvals'; // Assumed for consistency
            break;
        }
        await updateApprovalStatus(activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks', id, airtableStatus);
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
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'approved', // Local state can remain 'approved' for UI consistency
            dateApproved: new Date().toISOString().split('T')[0]
          };
        }
      });

      return newItems;
    });

    // Clear selections after approving
    clearSelections();
  };

  const confirmRequestChanges = async (reason: string) => {
    // Check if this is a bulk action
    const isBulkAction = rejectionModal.itemId === 'bulk';

    if (isBulkAction) {
      // Get the selected items for the current tab
      const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];

      // Process each selected item
      for (const id of currentTabSelections) {
        try {
          await updateApprovalStatus(activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks', id, 'Brief Needs Revision', reason);
        } catch (error) {
          console.error(`Error requesting changes for item ${id}:`, error);
        }
      }
    } else {
      // Update a single item
      try {
        await updateApprovalStatus(activeTab as 'keywords' | 'briefs' | 'articles' | 'backlinks', rejectionModal.itemId, 'Brief Needs Revision', reason);
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
            return {
              ...item,
              status: 'revisions_needed',
              dateApproved: new Date().toISOString().split('T')[0],
              revisionReason: reason
            };
          }
          return item;
        });
      } else {
        // Update a single item
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === rejectionModal.itemId);

        if (itemIndex !== -1) {
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'revisions_needed',
            dateApproved: new Date().toISOString().split('T')[0],
            revisionReason: reason
          };
        }
      }

      return newItems;
    });

    // Clear selections after applying changes
    clearSelections();
    setRejectionModal({ isOpen: false, itemId: '' });
  };

  return (
    <DashboardLayout>
      {/* Global Summary Banner */}
      <GlobalSummaryBanner
        counts={pendingCounts}
        isLoading={isLoading}
        clientId={clientId}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {/* Tab Navigation */}
          <PageContainer>
            <PageContainerTabs>
              <TabNavigation
                tabs={[
                  { id: 'keywords', label: 'Keyword', icon: <TrendingUp size={18} /> },
                  { id: 'briefs', label: 'Briefs', icon: <FileText size={18} /> },
                  { id: 'articles', label: 'Articles', icon: <BookOpen size={18} /> },
                  { id: 'backlinks', label: 'Backlinks', icon: <Link2 size={18} /> },
                  // Quick Wins tab is optional per requirements
                  ...(items.quickwins.length > 0 ? [{ id: 'quickwins', label: 'Quick Wins', icon: <Zap size={18} /> }] : [])
                ]}
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  clearSelections(); // Clear selections when changing tabs
                }}
                variant="primary"
                containerClassName="overflow-x-auto"
              />
            </PageContainerTabs>
            <PageContainerBody>
              {/* Bulk action buttons */}
              <div className="mb-4 flex justify-end">
                {tabReviewCount > 0 && (
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
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9EA8FB] mb-4"></div>
                    <p className="text-gray-600 text-base font-medium mb-2">
                      {clientId && clientId !== 'all'
                        ? `Loading ${activeTab} for selected client...`
                        : `Loading ${activeTab}...`}
                    </p>
                    <p className="text-gray-500 text-sm max-w-md text-center">
                      Fetching all records to provide accurate pagination. This may take a moment for large datasets.
                    </p>
                    <div className="mt-4 flex flex-col items-center">
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#9EA8FB] animate-pulse"></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Please wait while we load all records...</p>
                    </div>
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
            isLoading={isLoading}
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

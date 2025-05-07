'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation, { TabContent } from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerHeader, PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';

// Sample approval data
const approvalItems = {
  keywords: [
    { id: 1, item: 'enterprise seo services', volume: 1200, difficulty: 'High', status: 'awaiting_approval', dateSubmitted: '2025-04-01', lastUpdated: '2 days ago', strategist: 'Taylor Roberts' },
    { id: 2, item: 'seo agency for saas', volume: 880, difficulty: 'Medium', status: 'awaiting_approval', dateSubmitted: '2025-04-01', lastUpdated: '2 days ago', strategist: 'Taylor Roberts' },
    { id: 3, item: 'b2b seo strategy', volume: 720, difficulty: 'Medium', status: 'resubmitted', dateSubmitted: '2025-03-30', lastUpdated: '3 days ago', strategist: 'Alex Johnson' },
    { id: 4, item: 'content marketing for tech', volume: 1500, difficulty: 'High', status: 'approved', dateSubmitted: '2025-03-28', dateApproved: '2025-03-29', lastUpdated: '5 days ago', strategist: 'Taylor Roberts' },
    { id: 5, item: 'seo for startups', volume: 2200, difficulty: 'High', status: 'approved', dateSubmitted: '2025-03-25', dateApproved: '2025-03-26', lastUpdated: '8 days ago', strategist: 'Alex Johnson' },
    { id: 6, item: 'link building services', volume: 1800, difficulty: 'Very High', status: 'needs_revision', dateSubmitted: '2025-03-22', dateApproved: '2025-03-23', revisionReason: 'Too competitive for current resources', lastUpdated: '10 days ago', strategist: 'Sarah Williams' },
  ],
  briefs: [
    { id: 1, item: 'Customer Onboarding Brief', type: 'Frase', status: 'awaiting_approval', dateSubmitted: '2025-04-02', lastUpdated: '2 days ago', strategist: 'Taylor Roberts' },
    { id: 2, item: 'Keyword Research Brief', type: 'Google Doc', status: 'needs_revision', dateSubmitted: '2025-04-01', lastUpdated: 'April 18', strategist: 'Taylor Roberts' },
    { id: 3, item: 'Conversion Optimization Brief', type: 'Google Doc', status: 'needs_revision', dateSubmitted: '2025-03-31', lastUpdated: 'April 12', strategist: 'Taylor Roberts' },
    { id: 4, item: 'Competitor Analysis Brief', type: 'Google Doc', status: 'needs_revision', dateSubmitted: '2025-03-30', lastUpdated: 'April 8', strategist: 'Taylor Roberts' },
    { id: 5, item: 'Benchmark Review', type: 'Google Doc', status: 'approved', dateSubmitted: '2025-03-28', dateApproved: '2025-03-29', lastUpdated: 'April 8', strategist: 'Taylor Roberts' },
  ],
  articles: [
    { id: 1, item: 'Ultimate Guide to Enterprise SEO in 2025', wordCount: 2500, status: 'awaiting_approval', dateSubmitted: '2025-04-02', lastUpdated: '2 days ago', strategist: 'Sarah Williams' },
    { id: 2, item: 'How to Choose the Right SEO Agency for Your SaaS', wordCount: 1800, status: 'awaiting_approval', dateSubmitted: '2025-04-01', lastUpdated: '3 days ago', strategist: 'Alex Johnson' },
    { id: 3, item: 'B2B SEO Strategy: A Step-by-Step Guide', wordCount: 2200, status: 'resubmitted', dateSubmitted: '2025-03-31', lastUpdated: '4 days ago', strategist: 'Taylor Roberts' },
    { id: 4, item: '10 Content Marketing Tactics for Tech Companies', wordCount: 1500, status: 'approved', dateSubmitted: '2025-03-27', dateApproved: '2025-03-28', lastUpdated: '7 days ago', strategist: 'Sarah Williams' },
    { id: 5, item: 'SEO for Startups: A Complete Playbook', wordCount: 3000, status: 'approved', dateSubmitted: '2025-03-24', dateApproved: '2025-03-25', lastUpdated: '10 days ago', strategist: 'Alex Johnson' },
  ],
  backlinks: [
    { id: 1, item: 'Tech Industry Backlink Package', count: 15, status: 'awaiting_approval', dateSubmitted: '2025-04-02', lastUpdated: '2 days ago', strategist: 'Sarah Williams' },
    { id: 2, item: 'SaaS Niche Link Building', count: 8, status: 'approved', dateSubmitted: '2025-03-25', dateApproved: '2025-03-26', lastUpdated: '9 days ago', strategist: 'Alex Johnson' },
  ],
  quickwins: [
    { id: 1, item: 'Meta Description Updates', pages: 12, status: 'awaiting_approval', dateSubmitted: '2025-04-01', lastUpdated: '3 days ago', strategist: 'Taylor Roberts' },
    { id: 2, item: 'Internal Linking Improvements', pages: 8, status: 'approved', dateSubmitted: '2025-03-20', dateApproved: '2025-03-21', lastUpdated: '14 days ago', strategist: 'Sarah Williams' },
  ]
};

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let bgColor = '';
  let textColor = '';
  let displayText = '';

  switch (status) {
    case 'awaiting_approval':
      bgColor = 'bg-yellow-50';
      textColor = 'text-gray-700';
      displayText = 'Awaiting Approval';
      break;
    case 'resubmitted':
      bgColor = 'bg-blue-50';
      textColor = 'text-gray-700';
      displayText = 'Resubmitted';
      break;
    case 'needs_revision':
      bgColor = 'bg-orange-50';
      textColor = 'text-gray-700';
      displayText = 'Needs Revision';
      break;
    case 'approved':
      bgColor = 'bg-green-50';
      textColor = 'text-gray-700';
      displayText = 'Approved';
      break;
    case 'rejected':
      bgColor = 'bg-red-50';
      textColor = 'text-gray-700';
      displayText = 'Rejected';
      break;
    default:
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-700';
      displayText = status.replace('_', ' ');
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

// Request Changes Modal Component
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
          <h3 className="text-lg font-medium text-dark">Request Changes</h3>
          <p className="text-mediumGray text-sm">Please provide details about the changes needed:</p>
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
function GlobalSummaryBanner({ counts }: {
  counts: { [key: string]: number }
}) {
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const categoriesCount = Object.values(counts).filter(count => count > 0).length;

  return (
    <div className="p-6 rounded-lg mb-6 border-4 border-[#9EA8FB] bg-[#9EA8FB]/10 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-dark text-lg mb-1 notification-text">Pending Approvals</p>
          <p className="text-base text-mediumGray">You have {totalCount} items awaiting your review across {categoriesCount} categories</p>
        </div>
      </div>
    </div>
  );
}

// Sidebar Summary Panel Component
function SidebarSummaryPanel({ counts, totalApproved, totalPending }: {
  counts: { [key: string]: number },
  totalApproved: number,
  totalPending: number
}) {
  // Calculate the percentage for the progress circle
  const percentage = totalPending > 0 ? (totalApproved / (totalApproved + totalPending)) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-medium text-dark mb-3 text-center text-base">Pending Approvals</h3>

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

      <div className="text-base">
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
  areAllItemsSelected
}: {
  groupedItems: { [key: string]: any[] },
  onApprove: (id: number) => void,
  onRequestChanges: (id: number) => void,
  selectedItems: number[],
  onToggleItemSelection: (id: number) => void,
  onToggleGroupSelection: (items: any[], isSelected: boolean) => void,
  areAllItemsSelected: (items: any[]) => boolean
}) {
  // Define the order of status groups
  const statusOrder = ['awaiting_approval', 'resubmitted', 'needs_revision', 'approved', 'rejected'];

  // Status group headers
  const statusHeaders = {
    awaiting_approval: 'Awaiting Approval',
    resubmitted: 'Resubmitted',
    needs_revision: 'Needs Revision',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  // Function to render a table section for a status group
  const renderStatusGroup = (status: string) => {
    const items = groupedItems[status];
    if (!items || items.length === 0) return null;

    // Check if all items in this group are selected
    const allSelected = areAllItemsSelected(items);

    // Always show checkbox column for consistent layout, but only make them interactive for actionable items
    const showInteractiveCheckboxes = ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(status);

    return (
      <div key={status} className="mb-6">
        <h3 className="font-medium text-dark mb-2 text-base">{statusHeaders[status as keyof typeof statusHeaders]}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-gray-100">
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
                <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '15%' }}>Assigned To</th>
                <th className="px-4 py-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '15%' }}>Last Updated</th>
                <th className="px-4 py-3 text-center text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '10%' }}>Status</th>
                <th className="px-4 py-3 text-right text-base font-bold text-gray-700 uppercase tracking-wider" style={{ width: '25%' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => {
                // No special styling for different statuses

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
                            <a href="#" className="hover:text-primary hover:underline">{item.item}</a>
                          </div>
                          {'type' in item && <div className="text-base text-mediumGray">{item.type}</div>}
                          {'wordCount' in item && <div className="text-base text-mediumGray">{item.wordCount} words</div>}
                          {'volume' in item && <div className="text-base text-mediumGray">Volume: {item.volume}</div>}
                          {'count' in item && <div className="text-base text-mediumGray">{item.count} links</div>}
                          {'pages' in item && <div className="text-base text-mediumGray">{item.pages} pages</div>}
                          {item.revisionReason && (
                            <div className="text-base text-gray-700 mt-1 bg-gray-50 p-1 rounded border border-gray-200">
                              <span className="font-medium">Revision: </span>{item.revisionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ width: '15%' }}>
                      <div className="text-base text-dark">{item.strategist}</div>
                    </td>
                    <td className="px-4 py-3" style={{ width: '15%' }}>
                      <div className="text-base text-mediumGray">{item.lastUpdated}</div>
                    </td>
                    <td className="px-4 py-3 text-center" style={{ width: '10%' }}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right" style={{ width: '25%' }}>
                      {(item.status === 'awaiting_approval' || item.status === 'resubmitted' || item.status === 'needs_revision') && (
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
                            Request Changes
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
      </div>
    );
  };

  return (
    <div>
      {statusOrder.map(status => renderStatusGroup(status))}
    </div>
  );
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState<string>('briefs');
  const [items, setItems] = useState(approvalItems);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, itemId: 0 });
  const [filter, setFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number[]}>({
    keywords: [],
    briefs: [],
    articles: [],
    backlinks: [],
    quickwins: []
  });

  // Calculate counts for pending items in each category
  const pendingCounts = {
    keywords: items.keywords.filter(item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    briefs: items.briefs.filter(item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    articles: items.articles.filter(item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    backlinks: items.backlinks.filter(item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status)).length,
    quickwins: items.quickwins.filter(item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status)).length,
  };

  // Calculate total approved and pending items
  const totalApproved = Object.values(items).flat().filter(item => item.status === 'approved').length;
  const totalPending = Object.values(pendingCounts).reduce((sum, count) => sum + count, 0);

  // Group items by status
  const groupedItems = {
    awaiting_approval: items[activeTab as keyof typeof items].filter(item => item.status === 'awaiting_approval'),
    resubmitted: items[activeTab as keyof typeof items].filter(item => item.status === 'resubmitted'),
    needs_revision: items[activeTab as keyof typeof items].filter(item => item.status === 'needs_revision'),
    approved: items[activeTab as keyof typeof items].filter(item => item.status === 'approved'),
    rejected: items[activeTab as keyof typeof items].filter(item => item.status === 'rejected'),
  };

  // Filter items based on active tab and filter
  const filteredItems = items[activeTab as keyof typeof items].filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['awaiting_approval', 'resubmitted'].includes(item.status);
    return item.status === filter;
  });

  // Get count of items to review in current tab
  const tabReviewCount = items[activeTab as keyof typeof items].filter(
    item => ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status)
  ).length;

  const handleApprove = (id: number) => {
    setItems(prev => {
      const newItems = { ...prev };
      const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === id);

      if (itemIndex !== -1) {
        newItems[activeTab as keyof typeof items][itemIndex] = {
          ...newItems[activeTab as keyof typeof items][itemIndex],
          status: 'approved',
          dateApproved: new Date().toISOString().split('T')[0]
        };
      }

      return newItems;
    });
  };

  const handleRequestChanges = (id: number) => {
    setRejectionModal({ isOpen: true, itemId: id });
  };

  // Handle selecting/deselecting a single item
  const toggleItemSelection = (id: number) => {
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
  const toggleGroupSelection = (statusItems: any[], isSelected: boolean) => {
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

  // Clear all selections for the current tab
  const clearSelections = () => {
    setSelectedItems(prev => {
      const newSelectedItems = { ...prev };
      newSelectedItems[activeTab as keyof typeof prev] = [];
      return newSelectedItems;
    });
  };

  // Check if all items in a group are selected
  const areAllItemsSelected = (statusItems: any[]) => {
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
  const approveSelectedItems = () => {
    const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];

    setItems(prev => {
      const newItems = { ...prev };

      currentTabSelections.forEach(id => {
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === id);

        if (itemIndex !== -1 && ['awaiting_approval', 'resubmitted', 'needs_revision'].includes(newItems[activeTab as keyof typeof items][itemIndex].status)) {
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'approved',
            dateApproved: new Date().toISOString().split('T')[0]
          };
        }
      });

      return newItems;
    });

    // Clear selections after approving
    clearSelections();
  };

  const confirmRequestChanges = (reason: string) => {
    setItems(prev => {
      const newItems = { ...prev };

      // Check if this is a bulk action (itemId = -1)
      if (rejectionModal.itemId === -1) {
        // Get the selected items for the current tab
        const currentTabSelections = selectedItems[activeTab as keyof typeof selectedItems];

        // Update only selected pending items in the current tab
        newItems[activeTab as keyof typeof items] = newItems[activeTab as keyof typeof items].map(item => {
          if (['awaiting_approval', 'resubmitted', 'needs_revision'].includes(item.status) && currentTabSelections.includes(item.id)) {
            return {
              ...item,
              status: 'needs_revision',
              dateApproved: new Date().toISOString().split('T')[0],
              revisionReason: reason
            };
          }
          return item;
        }) as any;
      } else {
        // Update a single item
        const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === rejectionModal.itemId);

        if (itemIndex !== -1) {
          newItems[activeTab as keyof typeof items][itemIndex] = {
            ...newItems[activeTab as keyof typeof items][itemIndex],
            status: 'needs_revision',
            dateApproved: new Date().toISOString().split('T')[0],
            revisionReason: reason
          };
        }
      }

      return newItems;
    });

    // Clear selections after applying changes
    clearSelections();
    setRejectionModal({ isOpen: false, itemId: 0 });
  };

  return (
    <DashboardLayout>
      {/* Global Summary Banner */}
      <GlobalSummaryBanner counts={pendingCounts} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {/* Tab Navigation */}
          <PageContainer>
            <PageContainerTabs>
              <TabNavigation
                tabs={[
                  { id: 'keywords', label: 'Keyword' },
                  { id: 'briefs', label: 'Briefs' },
                  { id: 'articles', label: 'Articles' },
                  { id: 'backlinks', label: 'Backlinks' },
                  // Quick Wins tab is optional per requirements
                  ...(items.quickwins.length > 0 ? [{ id: 'quickwins', label: 'Quick Wins' }] : [])
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
                          setRejectionModal({ isOpen: true, itemId: -1 });
                        }
                      }}
                      disabled={getSelectedApprovableCount() === 0}
                      className={`px-4 py-1 text-base font-medium rounded-md transition-colors ${
                        getSelectedApprovableCount() > 0
                          ? 'text-[#353233] border border-[#D9D9D9] hover:bg-gray-100'
                          : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Request Changes
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
                {Object.values(groupedItems).some(items => items.length > 0) ? (
                  <ApprovalTable
                    groupedItems={groupedItems}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    selectedItems={selectedItems[activeTab as keyof typeof selectedItems]}
                    onToggleItemSelection={toggleItemSelection}
                    onToggleGroupSelection={toggleGroupSelection}
                    areAllItemsSelected={areAllItemsSelected}
                  />
                ) : (
                  <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-500 py-4 text-base">No items found in this section.</p>
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
          />
        </div>
      </div>

      {/* Rejection/Request Changes Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, itemId: 0 })}
        onConfirm={confirmRequestChanges}
      />
    </DashboardLayout>
  );
}

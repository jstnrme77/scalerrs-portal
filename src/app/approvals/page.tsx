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
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
      displayText = 'Awaiting Approval';
      break;
    case 'resubmitted':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      displayText = 'Resubmitted';
      break;
    case 'needs_revision':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      displayText = 'Needs Revision';
      break;
    case 'approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      displayText = 'Approved';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      displayText = 'Rejected';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
      displayText = status.replace('_', ' ');
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
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
    <div className="bg-white p-4 rounded-lg border border-lightGray">
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
        <div className="text-sm text-purple-800 bg-purple-50 p-2 rounded mb-3">
          <span className="font-medium">Revision Needed:</span> {item.revisionReason}
        </div>
      )}

      {(item.status === 'awaiting_approval' || item.status === 'resubmitted' || item.status === 'needs_revision') && (
        <div className="flex space-x-2">
          <button
            onClick={() => onApprove(item.id)}
            className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onRequestChanges(item.id)}
            className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-dark mb-2">Request Changes</h3>
        <p className="text-mediumGray text-sm mb-4">Please provide details about the changes needed:</p>
        <textarea
          className="w-full border border-lightGray rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          placeholder="Describe the changes needed..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded hover:bg-gray-300 transition-colors"
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
            className={`px-4 py-2 text-sm font-medium rounded-scalerrs transition-colors ${reason.trim() ? 'text-white bg-primary hover:bg-primary/80' : 'text-white bg-primary/50 cursor-not-allowed'}`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

// Global Summary Banner Component
function GlobalSummaryBanner({ counts, onTabChange }: {
  counts: { [key: string]: number },
  onTabChange: (tab: string) => void
}) {
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const categoriesCount = Object.values(counts).filter(count => count > 0).length;

  return (
    <div className="bg-[#FFF8E1] p-4 rounded-lg mb-6 border border-[#FFE082]">
      <p className="font-medium">You have {totalCount} items awaiting your review across {categoriesCount} categories</p>
      <div className="text-sm mt-1">
        Jump to: {' '}
        {counts.keywords > 0 && (
          <button
            className="text-primary hover:underline ml-2"
            onClick={() => onTabChange('keywords')}
          >
            Keyword Plans ({counts.keywords})
          </button>
        )}
        {counts.briefs > 0 && (
          <button
            className="text-primary hover:underline ml-2"
            onClick={() => onTabChange('briefs')}
          >
            Briefs ({counts.briefs})
          </button>
        )}
        {counts.articles > 0 && (
          <button
            className="text-primary hover:underline ml-2"
            onClick={() => onTabChange('articles')}
          >
            Articles ({counts.articles})
          </button>
        )}
        {counts.backlinks > 0 && (
          <button
            className="text-primary hover:underline ml-2"
            onClick={() => onTabChange('backlinks')}
          >
            Link Lists ({counts.backlinks})
          </button>
        )}
        {counts.quickwins > 0 && (
          <button
            className="text-primary hover:underline ml-2"
            onClick={() => onTabChange('quickwins')}
          >
            Quick Wins ({counts.quickwins})
          </button>
        )}
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
  const dashOffset = 283 - (283 * percentage / 100);

  return (
    <div className="bg-white p-4 rounded-lg border border-lightGray">
      <h3 className="font-medium text-dark mb-3">Pending Approvals</h3>

      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="10"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#9EA8FB"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold">{totalApproved} of {totalApproved + totalPending}</span>
            <span className="text-xs text-mediumGray">items</span>
          </div>
        </div>
      </div>

      <div className="text-sm">
        <div className="flex justify-between py-2 border-b border-lightGray">
          <span>Keyword Plans</span>
          <span className="font-medium">{counts.keywords}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-lightGray">
          <span>Briefs</span>
          <span className="font-medium">{counts.briefs}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-lightGray">
          <span>Articles</span>
          <span className="font-medium">{counts.articles}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-lightGray">
          <span>Link Lists</span>
          <span className="font-medium">{counts.backlinks}</span>
        </div>
        {counts.quickwins > 0 && (
          <div className="flex justify-between py-2">
            <span>Quick Wins</span>
            <span className="font-medium">{counts.quickwins}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Table Component
function ApprovalTable({ items, onApprove, onRequestChanges }: {
  items: any[],
  onApprove: (id: number) => void,
  onRequestChanges: (id: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-lightGray">
        <thead>
          <tr className="bg-lightGray">
            <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Deliverable</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Strategist</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Last Updated</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-mediumGray uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-lightGray">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-lightGray/30">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-start">
                  <div>
                    <div className="text-sm font-medium text-dark">{item.item}</div>
                    {'type' in item && <div className="text-xs text-mediumGray">{item.type}</div>}
                    {'wordCount' in item && <div className="text-xs text-mediumGray">{item.wordCount} words</div>}
                    {'volume' in item && <div className="text-xs text-mediumGray">Volume: {item.volume}</div>}
                    {'count' in item && <div className="text-xs text-mediumGray">{item.count} links</div>}
                    {'pages' in item && <div className="text-xs text-mediumGray">{item.pages} pages</div>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-dark">{item.strategist}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-mediumGray">{item.lastUpdated}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                {(item.status === 'awaiting_approval' || item.status === 'resubmitted' || item.status === 'needs_revision') && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onRequestChanges(item.id)}
                      className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
                    >
                      Request Changes
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState<string>('briefs');
  const [items, setItems] = useState(approvalItems);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, itemId: 0 });
  const [filter, setFilter] = useState('all');

  // Calculate counts for pending items in each category
  const pendingCounts = {
    keywords: items.keywords.filter(item => ['awaiting_approval', 'resubmitted'].includes(item.status)).length,
    briefs: items.briefs.filter(item => ['awaiting_approval', 'resubmitted'].includes(item.status)).length,
    articles: items.articles.filter(item => ['awaiting_approval', 'resubmitted'].includes(item.status)).length,
    backlinks: items.backlinks.filter(item => ['awaiting_approval', 'resubmitted'].includes(item.status)).length,
    quickwins: items.quickwins.filter(item => ['awaiting_approval', 'resubmitted'].includes(item.status)).length,
  };

  // Calculate total approved and pending items
  const totalApproved = Object.values(items).flat().filter(item => item.status === 'approved').length;
  const totalPending = Object.values(pendingCounts).reduce((sum, count) => sum + count, 0);

  // Filter items based on active tab and filter
  const filteredItems = items[activeTab as keyof typeof items].filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['awaiting_approval', 'resubmitted'].includes(item.status);
    return item.status === filter;
  });

  // Get count of items to review in current tab
  const tabReviewCount = items[activeTab as keyof typeof items].filter(
    item => ['awaiting_approval', 'resubmitted'].includes(item.status)
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

  const confirmRequestChanges = (reason: string) => {
    setItems(prev => {
      const newItems = { ...prev };
      const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === rejectionModal.itemId);

      if (itemIndex !== -1) {
        newItems[activeTab as keyof typeof items][itemIndex] = {
          ...newItems[activeTab as keyof typeof items][itemIndex],
          status: 'needs_revision',
          dateApproved: new Date().toISOString().split('T')[0],
          revisionReason: reason
        };
      }

      return newItems;
    });

    setRejectionModal({ isOpen: false, itemId: 0 });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Approvals</h1>
        <p className="text-mediumGray">Review and approve deliverables</p>
      </div>

      {/* Global Summary Banner */}
      <GlobalSummaryBanner counts={pendingCounts} onTabChange={setActiveTab} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {/* Tab Navigation */}
          <PageContainer className="mb-6">
            <PageContainerTabs>
              <TabNavigation
                tabs={[
                  { id: 'keywords', label: 'Keyword Plans' },
                  { id: 'briefs', label: 'Briefs' },
                  { id: 'articles', label: 'Articles' },
                  { id: 'backlinks', label: 'Link Lists' },
                  { id: 'quickwins', label: 'Quick Wins' }
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="primary"
                containerClassName="overflow-x-auto"
              />
            </PageContainerTabs>
            <PageContainerBody>
              {/* Tab-level header */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">You have {tabReviewCount} item{tabReviewCount !== 1 ? 's' : ''} to review in this section</p>
                </div>

                {tabReviewCount > 0 && (
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-scalerrs hover:bg-primary/80 transition-colors">
                      Approve All
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors">
                      Request Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Table View */}
              <div className="overflow-hidden">
                {filteredItems.length > 0 ? (
                  <ApprovalTable
                    items={filteredItems}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-mediumGray">No items found in this section.</p>
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

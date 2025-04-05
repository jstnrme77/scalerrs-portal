'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Sample approval data
const approvalItems = {
  keywords: [
    { id: 1, item: 'enterprise seo services', volume: 1200, difficulty: 'High', status: 'pending', dateSubmitted: '2025-04-01' },
    { id: 2, item: 'seo agency for saas', volume: 880, difficulty: 'Medium', status: 'pending', dateSubmitted: '2025-04-01' },
    { id: 3, item: 'b2b seo strategy', volume: 720, difficulty: 'Medium', status: 'pending', dateSubmitted: '2025-03-30' },
    { id: 4, item: 'content marketing for tech', volume: 1500, difficulty: 'High', status: 'approved', dateSubmitted: '2025-03-28', dateApproved: '2025-03-29' },
    { id: 5, item: 'seo for startups', volume: 2200, difficulty: 'High', status: 'approved', dateSubmitted: '2025-03-25', dateApproved: '2025-03-26' },
    { id: 6, item: 'link building services', volume: 1800, difficulty: 'Very High', status: 'rejected', dateSubmitted: '2025-03-22', dateApproved: '2025-03-23', rejectionReason: 'Too competitive for current resources' },
  ],
  targetPages: [
    { id: 1, item: '/services/enterprise-seo', type: 'Service Page', status: 'pending', dateSubmitted: '2025-04-02' },
    { id: 2, item: '/blog/b2b-seo-strategy-guide', type: 'Blog Post', status: 'pending', dateSubmitted: '2025-04-01' },
    { id: 3, item: '/case-studies/saas-seo-results', type: 'Case Study', status: 'pending', dateSubmitted: '2025-03-30' },
    { id: 4, item: '/services/content-marketing', type: 'Service Page', status: 'approved', dateSubmitted: '2025-03-28', dateApproved: '2025-03-29' },
    { id: 5, item: '/blog/startup-seo-guide', type: 'Blog Post', status: 'approved', dateSubmitted: '2025-03-25', dateApproved: '2025-03-26' },
  ],
  contentBriefs: [
    { id: 1, item: 'Ultimate Guide to Enterprise SEO in 2025', wordCount: 2500, status: 'pending', dateSubmitted: '2025-04-02' },
    { id: 2, item: 'How to Choose the Right SEO Agency for Your SaaS', wordCount: 1800, status: 'pending', dateSubmitted: '2025-04-01' },
    { id: 3, item: 'B2B SEO Strategy: A Step-by-Step Guide', wordCount: 2200, status: 'pending', dateSubmitted: '2025-03-31' },
    { id: 4, item: '10 Content Marketing Tactics for Tech Companies', wordCount: 1500, status: 'approved', dateSubmitted: '2025-03-27', dateApproved: '2025-03-28' },
    { id: 5, item: 'SEO for Startups: A Complete Playbook', wordCount: 3000, status: 'approved', dateSubmitted: '2025-03-24', dateApproved: '2025-03-25' },
  ],
};

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'pending':
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
      break;
    case 'approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Approval Item Component
function ApprovalItem({ 
  item, 
  onApprove, 
  onReject 
}: { 
  item: any; 
  onApprove: (id: number) => void; 
  onReject: (id: number) => void; 
}) {
  return (
    <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
        <h3 className="text-md font-medium text-dark">{item.item}</h3>
        <StatusBadge status={item.status} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
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
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Submitted:</span> {new Date(item.dateSubmitted).toLocaleDateString()}
        </div>
        
        {item.dateApproved && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Approved:</span> {new Date(item.dateApproved).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {item.rejectionReason && (
        <div className="text-sm text-red-600 mb-3">
          <span className="font-medium">Rejection Reason:</span> {item.rejectionReason}
        </div>
      )}
      
      {item.status === 'pending' && (
        <div className="flex space-x-2">
          <button 
            onClick={() => onApprove(item.id)}
            className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-scalerrs hover:bg-green-200 transition-colors"
          >
            Approve
          </button>
          <button 
            onClick={() => onReject(item.id)}
            className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-scalerrs hover:bg-red-200 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// Rejection Modal Component
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
      <div className="bg-white p-6 rounded-scalerrs shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-dark mb-4">Rejection Reason</h3>
        <textarea 
          className="w-full border border-lightGray rounded-scalerrs p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          placeholder="Please provide a reason for rejection..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-300 transition-colors"
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
            className={`px-4 py-2 text-sm font-medium text-white rounded-scalerrs ${reason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'} transition-colors`}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('keywords');
  const [items, setItems] = useState(approvalItems);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, itemId: 0 });
  const [filter, setFilter] = useState('all');
  
  const filteredItems = items[activeTab as keyof typeof items].filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });
  
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
  
  const handleReject = (id: number) => {
    setRejectionModal({ isOpen: true, itemId: id });
  };
  
  const confirmRejection = (reason: string) => {
    setItems(prev => {
      const newItems = { ...prev };
      const itemIndex = newItems[activeTab as keyof typeof items].findIndex(item => item.id === rejectionModal.itemId);
      
      if (itemIndex !== -1) {
        newItems[activeTab as keyof typeof items][itemIndex] = {
          ...newItems[activeTab as keyof typeof items][itemIndex],
          status: 'rejected',
          dateApproved: new Date().toISOString().split('T')[0],
          rejectionReason: reason
        };
      }
      
      return newItems;
    });
    
    setRejectionModal({ isOpen: false, itemId: 0 });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Approvals</h1>
        <p className="text-mediumGray">Review and approve keywords, target pages, and content briefs</p>
      </div>
      
      <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-8">
        <div className="flex border-b border-lightGray overflow-x-auto">
          <button 
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'keywords' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('keywords')}
          >
            Keywords
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'targetPages' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('targetPages')}
          >
            Target Pages
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'contentBriefs' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('contentBriefs')}
          >
            Content Briefs
          </button>
        </div>
        
        <div className="p-4 border-b border-lightGray">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-full ${filter === 'all' ? 'bg-primary text-white' : 'bg-lightGray text-mediumGray hover:bg-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-full ${filter === 'pending' ? 'bg-gold text-white' : 'bg-gold/10 text-gold hover:bg-gold/20'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-full ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-full ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ApprovalItem 
                  key={item.id} 
                  item={item} 
                  onApprove={handleApprove} 
                  onReject={handleReject} 
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-mediumGray">No {filter !== 'all' ? filter : ''} items found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-lightGray p-4 rounded-scalerrs">
        <p className="text-sm text-mediumGray">
          <strong>Note:</strong> All approvals are logged and can be referenced in the monthly reports. Rejected items can be revised and resubmitted.
        </p>
      </div>
      
      <RejectionModal 
        isOpen={rejectionModal.isOpen} 
        onClose={() => setRejectionModal({ isOpen: false, itemId: 0 })} 
        onConfirm={confirmRejection} 
      />
    </DashboardLayout>
  );
}

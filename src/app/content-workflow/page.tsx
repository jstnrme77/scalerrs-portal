'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Sample content workflow data
const contentItems = [
  { 
    id: 1, 
    title: 'Ultimate Guide to Enterprise SEO in 2025', 
    targetKeyword: 'enterprise seo guide',
    stage: 'writing', 
    assignee: 'Jane Smith',
    dueDate: '2025-04-15',
    progress: 65,
    notes: 'Incorporating latest algorithm updates and case studies',
    history: [
      { stage: 'brief', date: '2025-03-25', user: 'John Doe' },
      { stage: 'research', date: '2025-03-28', user: 'Jane Smith' },
      { stage: 'writing', date: '2025-04-01', user: 'Jane Smith' },
    ]
  },
  { 
    id: 2, 
    title: 'How to Choose the Right SEO Agency for Your SaaS', 
    targetKeyword: 'saas seo agency selection',
    stage: 'editing', 
    assignee: 'John Doe',
    dueDate: '2025-04-10',
    progress: 85,
    notes: 'Final review pending from client',
    history: [
      { stage: 'brief', date: '2025-03-20', user: 'Jane Smith' },
      { stage: 'research', date: '2025-03-22', user: 'John Doe' },
      { stage: 'writing', date: '2025-03-28', user: 'John Doe' },
      { stage: 'editing', date: '2025-04-02', user: 'Jane Smith' },
    ]
  },
  { 
    id: 3, 
    title: 'B2B SEO Strategy: A Step-by-Step Guide', 
    targetKeyword: 'b2b seo strategy guide',
    stage: 'publishing', 
    assignee: 'Jane Smith',
    dueDate: '2025-04-05',
    progress: 95,
    notes: 'Scheduled for publication on April 5',
    history: [
      { stage: 'brief', date: '2025-03-15', user: 'John Doe' },
      { stage: 'research', date: '2025-03-18', user: 'Jane Smith' },
      { stage: 'writing', date: '2025-03-25', user: 'Jane Smith' },
      { stage: 'editing', date: '2025-03-30', user: 'John Doe' },
      { stage: 'publishing', date: '2025-04-03', user: 'Jane Smith' },
    ]
  },
  { 
    id: 4, 
    title: '10 Content Marketing Tactics for Tech Companies', 
    targetKeyword: 'tech content marketing tactics',
    stage: 'promotion', 
    assignee: 'John Doe',
    dueDate: '2025-04-02',
    progress: 100,
    notes: 'Promotion campaign running on social media',
    history: [
      { stage: 'brief', date: '2025-03-10', user: 'Jane Smith' },
      { stage: 'research', date: '2025-03-12', user: 'John Doe' },
      { stage: 'writing', date: '2025-03-18', user: 'John Doe' },
      { stage: 'editing', date: '2025-03-22', user: 'Jane Smith' },
      { stage: 'publishing', date: '2025-03-25', user: 'John Doe' },
      { stage: 'promotion', date: '2025-03-28', user: 'Jane Smith' },
    ]
  },
  { 
    id: 5, 
    title: 'SEO for Startups: A Complete Playbook', 
    targetKeyword: 'startup seo playbook',
    stage: 'brief', 
    assignee: 'Jane Smith',
    dueDate: '2025-04-30',
    progress: 10,
    notes: 'Research phase starting next week',
    history: [
      { stage: 'brief', date: '2025-04-01', user: 'John Doe' },
    ]
  },
  { 
    id: 6, 
    title: 'Local SEO for Enterprise Businesses', 
    targetKeyword: 'enterprise local seo',
    stage: 'research', 
    assignee: 'John Doe',
    dueDate: '2025-04-25',
    progress: 25,
    notes: 'Gathering case studies from enterprise clients',
    history: [
      { stage: 'brief', date: '2025-03-28', user: 'Jane Smith' },
      { stage: 'research', date: '2025-04-01', user: 'John Doe' },
    ]
  },
];

// Workflow stages
const stages = [
  { id: 'brief', name: 'Brief', color: 'bg-gold/10 text-gold' },
  { id: 'research', name: 'Research', color: 'bg-lavender/10 text-lavender' },
  { id: 'writing', name: 'Writing', color: 'bg-primary/10 text-primary' },
  { id: 'editing', name: 'Editing', color: 'bg-green-100 text-green-800' },
  { id: 'publishing', name: 'Publishing', color: 'bg-blue-100 text-blue-800' },
  { id: 'promotion', name: 'Promotion', color: 'bg-purple-100 text-purple-800' },
];

// Stage Badge Component
function StageBadge({ stage }: { stage: string }) {
  const stageInfo = stages.find(s => s.id === stage);
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${stageInfo?.color || 'bg-lightGray text-mediumGray'}`}>
      {stageInfo?.name || stage}
    </span>
  );
}

// Content Item Card Component
function ContentItemCard({ 
  item, 
  onView, 
  onAdvance 
}: { 
  item: any; 
  onView: (id: number) => void; 
  onAdvance: (id: number) => void; 
}) {
  const currentStageIndex = stages.findIndex(s => s.id === item.stage);
  const isLastStage = currentStageIndex === stages.length - 1;
  
  return (
    <div className="bg-white p-4 rounded-scalerrs border border-lightGray shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-dark">{item.title}</h3>
        <StageBadge stage={item.stage} />
      </div>
      
      <div className="mb-3">
        <div className="text-xs text-mediumGray mb-1">Progress</div>
        <div className="w-full bg-lightGray rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full bg-primary" 
            style={{ width: `${item.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Keyword:</span> {item.targetKeyword}
        </div>
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Assignee:</span> {item.assignee}
        </div>
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Due:</span> {new Date(item.dueDate).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => onView(item.id)}
          className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
        >
          View Details
        </button>
        
        {!isLastStage && (
          <button 
            onClick={() => onAdvance(item.id)}
            className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
          >
            Advance to {stages[currentStageIndex + 1].name}
          </button>
        )}
      </div>
    </div>
  );
}

// Content Detail Modal Component
function ContentDetailModal({ 
  isOpen, 
  item, 
  onClose 
}: { 
  isOpen: boolean; 
  item: any | null; 
  onClose: () => void; 
}) {
  if (!isOpen || !item) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-scalerrs shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-medium text-dark">{item.title}</h3>
          <button 
            onClick={onClose}
            className="text-mediumGray hover:text-dark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-mediumGray mb-1">Current Stage</div>
            <StageBadge stage={item.stage} />
          </div>
          
          <div>
            <div className="text-sm text-mediumGray mb-1">Progress</div>
            <div className="w-full bg-lightGray rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-primary" 
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-mediumGray mb-1">Target Keyword</div>
            <div className="font-medium text-dark">{item.targetKeyword}</div>
          </div>
          
          <div>
            <div className="text-sm text-mediumGray mb-1">Assignee</div>
            <div className="font-medium text-dark">{item.assignee}</div>
          </div>
          
          <div>
            <div className="text-sm text-mediumGray mb-1">Due Date</div>
            <div className="font-medium text-dark">{new Date(item.dueDate).toLocaleDateString()}</div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-mediumGray mb-1">Notes</div>
          <div className="bg-lightGray p-3 rounded-scalerrs text-dark">{item.notes}</div>
        </div>
        
        <div>
          <div className="text-sm text-mediumGray mb-2">Workflow History</div>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-lightGray"></div>
            <div className="space-y-4 ml-6">
              {item.history.map((event: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                  <div>
                    <div className="flex items-center">
                      <StageBadge stage={event.stage} />
                      <span className="text-xs text-mediumGray ml-2">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-dark mt-1">
                      Moved to {stages.find(s => s.id === event.stage)?.name} by {event.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentWorkflow() {
  const [items, setItems] = useState(contentItems);
  const [activeFilter, setActiveFilter] = useState('all');
  const [detailModal, setDetailModal] = useState({ isOpen: false, itemId: null as number | null });
  
  const filteredItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => item.stage === activeFilter);
  
  const handleViewDetail = (id: number) => {
    setDetailModal({ isOpen: true, itemId: id });
  };
  
  const handleCloseDetail = () => {
    setDetailModal({ isOpen: false, itemId: null });
  };
  
  const handleAdvanceStage = (id: number) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const currentStageIndex = stages.findIndex(s => s.id === item.stage);
          if (currentStageIndex < stages.length - 1) {
            const nextStage = stages[currentStageIndex + 1].id;
            
            // Calculate new progress based on stage
            const stageProgress = {
              brief: 10,
              research: 25,
              writing: 50,
              editing: 75,
              publishing: 90,
              promotion: 100
            };
            
            return {
              ...item,
              stage: nextStage,
              progress: stageProgress[nextStage as keyof typeof stageProgress],
              history: [
                ...item.history,
                { 
                  stage: nextStage, 
                  date: new Date().toISOString().split('T')[0], 
                  user: 'Current User' 
                }
              ]
            };
          }
        }
        return item;
      });
    });
  };
  
  const selectedItem = detailModal.itemId !== null 
    ? items.find(item => item.id === detailModal.itemId) 
    : null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Content Workflow</h1>
        <p className="text-mediumGray">Track content from brief to publication and promotion</p>
      </div>
      
      <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-8">
        <div className="p-4 border-b border-lightGray overflow-x-auto">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-full ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-lightGray text-mediumGray hover:bg-gray-300'}`}
              onClick={() => setActiveFilter('all')}
            >
              All Content
            </button>
            
            {stages.map(stage => (
              <button 
                key={stage.id}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  activeFilter === stage.id ? stage.color.replace('bg-', 'bg-').replace('/10', '') + ' text-white' : stage.color
                }`}
                onClick={() => setActiveFilter(stage.id)}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ContentItemCard 
                  key={item.id} 
                  item={item} 
                  onView={handleViewDetail} 
                  onAdvance={handleAdvanceStage} 
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-mediumGray">No content items found in this stage.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-lightGray p-4 rounded-scalerrs">
        <p className="text-sm text-mediumGray">
          <strong>Note:</strong> Content workflow is synchronized with our content management system. Changes made here will be reflected in the main system within 5 minutes.
        </p>
      </div>
      
      <ContentDetailModal 
        isOpen={detailModal.isOpen} 
        item={selectedItem} 
        onClose={handleCloseDetail} 
      />
    </DashboardLayout>
  );
}

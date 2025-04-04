'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Sample admin data
const adminData = {
  agreements: [
    { id: 1, name: 'SEO Service Agreement', type: 'PDF', lastUpdated: '2025-03-15', size: '1.2 MB' },
    { id: 2, name: 'Content Creation Terms', type: 'PDF', lastUpdated: '2025-02-20', size: '850 KB' },
    { id: 3, name: 'Link Building Addendum', type: 'PDF', lastUpdated: '2025-03-01', size: '620 KB' },
    { id: 4, name: 'Technical SEO Scope', type: 'DOCX', lastUpdated: '2025-03-10', size: '780 KB' },
  ],
  team: [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'SEO Strategist', access: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Content Manager', access: 'Editor' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'Link Building Specialist', access: 'Viewer' },
    { id: 4, name: 'Sarah Williams', email: 'sarah.williams@example.com', role: 'Technical SEO', access: 'Editor' },
    { id: 5, name: 'Michael Brown', email: 'michael.brown@example.com', role: 'Client', access: 'Viewer' },
  ],
  resources: [
    { id: 1, name: 'SEO Best Practices Guide', type: 'PDF', category: 'Education', lastUpdated: '2025-03-20', size: '2.4 MB' },
    { id: 2, name: 'Content Brief Template', type: 'DOCX', category: 'Template', lastUpdated: '2025-02-15', size: '450 KB' },
    { id: 3, name: 'Keyword Research Methodology', type: 'PDF', category: 'Education', lastUpdated: '2025-03-05', size: '1.8 MB' },
    { id: 4, name: 'Technical SEO Audit Checklist', type: 'XLSX', category: 'Template', lastUpdated: '2025-03-12', size: '680 KB' },
    { id: 6, name: 'Scalerrs Onboarding Video', type: 'MP4', category: 'Education', lastUpdated: '2025-01-30', size: '24.5 MB' },
  ],
  settings: {
    companyName: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://www.acmecorp.com',
    primaryContact: 'John Smith',
    contactEmail: 'john.smith@acmecorp.com',
    contactPhone: '(555) 123-4567',
    startDate: '2025-01-01',
    packageType: 'Enterprise SEO',
    reportFrequency: 'Weekly',
    notificationPreferences: ['Email', 'Portal'],
  }
};

// Access Level Badge Component
function AccessBadge({ access }: { access: string }) {
  let bgColor = '';
  let textColor = '';
  
  switch (access) {
    case 'Admin':
      bgColor = 'bg-primary/10';
      textColor = 'text-primary';
      break;
    case 'Editor':
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
      break;
    case 'Viewer':
      bgColor = 'bg-lavender/10';
      textColor = 'text-lavender';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {access}
    </span>
  );
}

// File Type Badge Component
function FileTypeBadge({ type }: { type: string }) {
  let bgColor = '';
  let textColor = '';
  
  switch (type) {
    case 'PDF':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'DOCX':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'XLSX':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'MP4':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {type}
    </span>
  );
}

// Document Card Component
function DocumentCard({ document }: { document: any }) {
  return (
    <div className="bg-white p-4 rounded-scalerrs border border-lightGray shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-dark">{document.name}</h3>
        <FileTypeBadge type={document.type} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Updated:</span> {new Date(document.lastUpdated).toLocaleDateString()}
        </div>
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Size:</span> {document.size}
        </div>
        
        {'category' in document && (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Category:</span> {document.category}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors">
          View
        </button>
        <button className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors">
          Download
        </button>
      </div>
    </div>
  );
}

// Team Member Card Component
function TeamMemberCard({ 
  member, 
  onEdit 
}: { 
  member: any; 
  onEdit: (id: number) => void; 
}) {
  return (
    <div className="bg-white p-4 rounded-scalerrs border border-lightGray shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-dark">{member.name}</h3>
        <AccessBadge access={member.access} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Role:</span> {member.role}
        </div>
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Email:</span> {member.email}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => onEdit(member.id)}
          className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
        >
          Edit Access
        </button>
      </div>
    </div>
  );
}

// Edit Access Modal Component
function EditAccessModal({ 
  isOpen, 
  member, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  member: any | null; 
  onClose: () => void; 
  onSave: (id: number, access: string) => void; 
}) {
  const [selectedAccess, setSelectedAccess] = useState('');
  
  if (!isOpen || !member) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-scalerrs shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-dark mb-4">Edit Access for {member.name}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-mediumGray mb-1">Access Level</label>
          <select 
            className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedAccess || member.access}
            onChange={(e) => setSelectedAccess(e.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-mediumGray mb-2">Access Level Permissions:</div>
          <div className="space-y-2">
            <div className="bg-primary/10 p-2 rounded-scalerrs">
              <div className="text-sm font-medium text-primary">Admin</div>
              <div className="text-xs text-mediumGray">Full access to all features, can manage users and settings</div>
            </div>
            
            <div className="bg-gold/10 p-2 rounded-scalerrs">
              <div className="text-sm font-medium text-gold">Editor</div>
              <div className="text-xs text-mediumGray">Can view and edit content, but cannot manage users or settings</div>
            </div>
            
            <div className="bg-lavender/10 p-2 rounded-scalerrs">
              <div className="text-sm font-medium text-lavender">Viewer</div>
              <div className="text-xs text-mediumGray">Can only view content, no editing capabilities</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(member.id, selectedAccess || member.access);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Team Member Modal Component
function AddTeamMemberModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (member: any) => void; 
}) {
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    role: '',
    access: 'Viewer'
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberData.name.trim() && memberData.email.trim() && memberData.role.trim()) {
      onAdd({
        ...memberData,
        id: Date.now()
      });
      setMemberData({
        name: '',
        email: '',
        role: '',
        access: 'Viewer'
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-scalerrs shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-dark mb-4">Add Team Member</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Name</label>
            <input 
              type="text" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter name"
              value={memberData.name}
              onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter email"
              value={memberData.email}
              onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Role</label>
            <input 
              type="text" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter role"
              value={memberData.role}
              onChange={(e) => setMemberData({ ...memberData, role: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Access Level</label>
            <select 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={memberData.access}
              onChange={(e) => setMemberData({ ...memberData, access: e.target.value })}
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('agreements');
  const [data, setData] = useState(adminData);
  const [editModal, setEditModal] = useState({ isOpen: false, memberId: null as number | null });
  const [addMemberModal, setAddMemberModal] = useState(false);
  
  const handleEditAccess = (id: number) => {
    setEditModal({ isOpen: true, memberId: id });
  };
  
  const handleSaveAccess = (id: number, access: string) => {
    setData(prev => {
      const newData = { ...prev };
      const memberIndex = newData.team.findIndex(member => member.id === id);
      
      if (memberIndex !== -1) {
        newData.team[memberIndex] = {
          ...newData.team[memberIndex],
          access
        };
      }
      
      return newData;
    });
  };
  
  const handleAddMember = (member: any) => {
    setData(prev => {
      return {
        ...prev,
        team: [...prev.team, member]
      };
    });
    
    setAddMemberModal(false);
  };
  
  const selectedMember = editModal.memberId !== null 
    ? data.team.find(member => member.id === editModal.memberId) 
    : null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Admin</h1>
        <p className="text-mediumGray">Manage agreements, team access, and resources</p>
      </div>
      
      <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-8">
        <div className="flex border-b border-lightGray overflow-x-auto">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'agreements' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('agreements')}
          >
            Agreements
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'team' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('team')}
          >
            Team Access
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'resources' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'agreements' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-dark">Service Agreements</h2>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Agreement
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.agreements.map(agreement => (
                  <DocumentCard key={agreement.id} document={agreement} />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'team' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-dark">Team Members</h2>
                <button 
                  onClick={() => setAddMemberModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Team Member
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.team.map(member => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member} 
                    onEdit={handleEditAccess} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-dark">Educational Resources</h2>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Resource
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.resources.map(resource => (
                  <DocumentCard key={resource.id} document={resource} />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-medium text-dark mb-4">Account Settings</h2>
              
              <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-lightGray">
                  <div className="p-4">
                    <h3 className="text-md font-medium text-dark mb-3">Company Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-mediumGray mb-1">Company Name</div>
                        <div className="font-medium text-dark">{data.settings.companyName}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-mediumGray mb-1">Industry</div>
                        <div className="font-medium text-dark">{data.settings.industry}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-mediumGray mb-1">Website</div>
                        <div className="font-medium text-primary">{data.settings.website}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-md font-medium text-dark mb-3">Contact Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-mediumGray mb-1">Primary Contact</div>
                        <div className="font-medium text-dark">{data.settings.primaryContact}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-mediumGray mb-1">Email</div>
                        <div className="font-medium text-dark">{data.settings.contactEmail}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-mediumGray mb-1">Phone</div>
                        <div className="font-medium text-dark">{data.settings.contactPhone}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-lightGray">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-lightGray">
                    <div className="p-4">
                      <h3 className="text-md font-medium text-dark mb-3">Service Details</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-mediumGray mb-1">Start Date</div>
                          <div className="font-medium text-dark">{new Date(data.settings.startDate).toLocaleDateString()}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-mediumGray mb-1">Package Type</div>
                          <div className="font-medium text-dark">{data.settings.packageType}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-md font-medium text-dark mb-3">Preferences</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-mediumGray mb-1">Report Frequency</div>
                          <div className="font-medium text-dark">{data.settings.reportFrequency}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-mediumGray mb-1">Notification Preferences</div>
                          <div className="flex flex-wrap gap-2">
                            {data.settings.notificationPreferences.map((pref, index) => (
                              <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                {pref}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors">
                  Edit Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-lightGray p-4 rounded-scalerrs">
        <p className="text-sm text-mediumGray">
          <strong>Note:</strong> Changes to team access will take effect immediately. For any issues with agreements or settings, please contact your account manager.
        </p>
      </div>
      
      <EditAccessModal 
        isOpen={editModal.isOpen} 
        member={selectedMember} 
        onClose={() => setEditModal({ isOpen: false, memberId: null })} 
        onSave={handleSaveAccess} 
      />
      
      <AddTeamMemberModal 
        isOpen={addMemberModal} 
        onClose={() => setAddMemberModal(false)} 
        onAdd={handleAddMember} 
      />
    </DashboardLayout>
  );
}

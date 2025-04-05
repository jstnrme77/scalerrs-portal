'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Sample admin data
const adminData = {
  agreements: [
    { id: 1, name: 'Master Services Agreement', type: 'Contract', lastUpdated: '2025-01-15', size: '1.2 MB' },
    { id: 2, name: 'SEO Campaign Scope of Work', type: 'Scope', lastUpdated: '2025-01-20', size: '850 KB' },
    { id: 3, name: 'Campaign Strategy Document', type: 'Strategy', lastUpdated: '2025-01-25', size: '620 KB' },
    { id: 4, name: 'Content Guidelines', type: 'Guidelines', lastUpdated: '2025-01-30', size: '780 KB' },
    { id: 5, name: 'Campaign Kickoff Presentation', type: 'Presentation', lastUpdated: '2025-02-05', size: '1.5 MB' },
  ],
  team: [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@agency.com', role: 'Account Manager', type: 'Agency', phone: '+1 (555) 123-4567', access: 'Admin' },
    { id: 2, name: 'Michael Chen', email: 'michael.c@agency.com', role: 'SEO Specialist', type: 'Agency', phone: '+1 (555) 234-5678', access: 'Admin' },
    { id: 3, name: 'Jessica Williams', email: 'jessica.w@agency.com', role: 'Content Strategist', type: 'Agency', phone: '+1 (555) 345-6789', access: 'Admin' },
    { id: 4, name: 'David Miller', email: 'david.m@agency.com', role: 'Technical SEO', type: 'Agency', phone: '+1 (555) 456-7890', access: 'Admin' },
    { id: 5, name: 'Robert Smith', email: 'robert.s@client.com', role: 'Marketing Director', type: 'Client', phone: '+1 (555) 567-8901', access: 'Viewer' },
    { id: 6, name: 'Emily Davis', email: 'emily.d@client.com', role: 'Content Manager', type: 'Client', phone: '+1 (555) 678-9012', access: 'Viewer' },
  ],
  access: [
    { id: 1, service: 'Google Analytics', username: 'client@example.com', password: '••••••••••' },
    { id: 2, service: 'Google Search Console', username: 'client@example.com', password: '••••••••••' },
    { id: 3, service: 'WordPress Admin', username: 'admin', password: '••••••••••' },
    { id: 4, service: 'Ahrefs', username: 'client_account', password: '••••••••••' },
  ],
  resources: [
    { id: 1, name: 'SEO Best Practices Guide', type: 'PDF', category: 'Education', lastUpdated: '2025-03-20', size: '2.4 MB' },
    { id: 2, name: 'Content Brief Template', type: 'DOCX', category: 'Template', lastUpdated: '2025-02-15', size: '450 KB' },
    { id: 3, name: 'Keyword Research Methodology', type: 'PDF', category: 'Education', lastUpdated: '2025-03-05', size: '1.8 MB' },
    { id: 4, name: 'Technical SEO Audit Checklist', type: 'XLSX', category: 'Template', lastUpdated: '2025-03-12', size: '680 KB' },
    { id: 6, name: 'Scalerrs Onboarding Video', type: 'MP4', category: 'Education', lastUpdated: '2025-01-30', size: '24.5 MB' },
  ],
  settings: {
    companyName: 'Acme Corp',
    industry: 'Technology',
    website: 'https://www.acmecorp.com',
    primaryContact: 'John Smith',
    contactEmail: 'john.smith@acmecorp.com',
    contactPhone: '(555) 123-4567',
    startDate: '2025-01-01',
    packageType: 'Enterprise SEO',
    reportFrequency: 'Weekly',
    notificationPreferences: ['Email', 'Portal'],
  },
  onboarding: {
    completed: false,
    lastUpdated: '2025-01-05',
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
        
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Phone:</span> {member.phone}
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
    access: 'Viewer',
    phone: '',
    type: 'Client'
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
        access: 'Viewer',
        phone: '',
        type: 'Client'
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
            <label className="block text-sm font-medium text-mediumGray mb-1">Phone</label>
            <input 
              type="text" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter phone number"
              value={memberData.phone}
              onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Type</label>
            <select 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={memberData.type}
              onChange={(e) => setMemberData({ ...memberData, type: e.target.value })}
            >
              <option value="Client">Client</option>
              <option value="Agency">Agency</option>
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

// Change Password Modal Component
function ChangePasswordModal({ 
  isOpen, 
  accessItem, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  accessItem: any | null; 
  onClose: () => void; 
  onSave: (id: number, newPassword: string) => void; 
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Save the new password
    onSave(accessItem?.id || 0, newPassword);
    
    // Reset form
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-scalerrs max-w-md w-full">
        <div className="p-4 border-b border-lightGray">
          <h3 className="text-lg font-medium text-dark">Change Password for {accessItem?.service}</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-mediumGray mb-1">Username</label>
              <input 
                type="text" 
                className="w-full border border-lightGray rounded-scalerrs p-2 bg-gray-50"
                value={accessItem?.username || ''}
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mediumGray mb-1">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full border border-lightGray rounded-scalerrs p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-mediumGray"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mediumGray mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full border border-lightGray rounded-scalerrs p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
          
          <div className="p-4 border-t border-lightGray flex justify-end space-x-3">
            <button 
              type="button" 
              className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
            >
              Update Password
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
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, accessId: null as number | null });
  const [selectedAccess, setSelectedAccess] = useState<any | null>(null);
  const [onboardingData, setOnboardingData] = useState({
    businessName: '',
    website: '',
    industry: '',
    competitors: '',
    targetAudience: '',
    goals: '',
    existingKeywords: '',
    contentStrategy: '',
    technicalIssues: '',
    analytics: {
      googleAnalytics: false,
      googleSearchConsole: false,
      ahrefs: false,
      semrush: false,
      other: ''
    },
    additionalNotes: ''
  });
  
  const handleEditAccess = (id: number) => {
    setEditModal({ isOpen: true, memberId: id });
    setSelectedMember(data.team.find(member => member.id === id) || null);
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
  
  const handleChangePassword = (id: number) => {
    const accessItem = data.access.find(item => item.id === id);
    setSelectedAccess(accessItem || null);
    setPasswordModal({ isOpen: true, accessId: id });
  };
  
  const handleSavePassword = (id: number, newPassword: string) => {
    // Update the password in the data
    setData(prevData => ({
      ...prevData,
      access: prevData.access.map(item => 
        item.id === id ? { ...item, password: '••••••••••' } : item
      )
    }));
    
    // In a real application, you would send this to an API
    console.log(`Password updated for service ID ${id}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Admin</h1>
        <p className="text-mediumGray">Manage your campaign settings and resources</p>
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
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'access' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('access')}
          >
            Access & Passwords
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'team' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('team')}
          >
            Team
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'resources' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'onboarding' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('onboarding')}
          >
            Onboarding
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
          
          {activeTab === 'access' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-dark">Access & Passwords</h2>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Access
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.access.map(access => (
                  <div key={access.id} className="bg-white p-4 rounded-scalerrs border border-lightGray shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-md font-medium text-dark">{access.service}</h3>
                      <button 
                        className="text-primary text-sm font-medium hover:text-primary/80"
                        onClick={() => handleChangePassword(access.id)}
                      >
                        Change Password
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-mediumGray">
                        <span className="font-medium">Username:</span> {access.username}
                      </div>
                      
                      <div className="text-sm text-mediumGray">
                        <span className="font-medium">Password:</span> {access.password}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button className="text-sm text-primary font-medium hover:text-primary/80">
                        Copy Login Info
                      </button>
                      <a href="#" className="text-sm text-primary font-medium hover:text-primary/80 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Go to Service
                      </a>
                    </div>
                  </div>
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
          
          {activeTab === 'onboarding' && (
            <div>
              <h2 className="text-lg font-medium text-dark mb-4">Client Onboarding Form</h2>
              <p className="text-mediumGray mb-6">Complete this form to help us better understand your business and SEO goals.</p>
              
              <form className="space-y-6">
                <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
                  <div className="p-4 border-b border-lightGray bg-gray-50">
                    <h3 className="text-md font-medium text-dark">Business Information</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Business Name</label>
                        <input 
                          type="text" 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={onboardingData.businessName}
                          onChange={(e) => setOnboardingData({...onboardingData, businessName: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Website URL</label>
                        <input 
                          type="text" 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={onboardingData.website}
                          onChange={(e) => setOnboardingData({...onboardingData, website: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Industry</label>
                        <input 
                          type="text" 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={onboardingData.industry}
                          onChange={(e) => setOnboardingData({...onboardingData, industry: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
                  <div className="p-4 border-b border-lightGray bg-gray-50">
                    <h3 className="text-md font-medium text-dark">SEO Strategy</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Main Competitors (one per line)</label>
                        <textarea 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                          value={onboardingData.competitors}
                          onChange={(e) => setOnboardingData({...onboardingData, competitors: e.target.value})}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Target Audience</label>
                        <textarea 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                          value={onboardingData.targetAudience}
                          onChange={(e) => setOnboardingData({...onboardingData, targetAudience: e.target.value})}
                          placeholder="Describe your ideal customer profile, demographics, and behaviors"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Business Goals</label>
                        <textarea 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                          value={onboardingData.goals}
                          onChange={(e) => setOnboardingData({...onboardingData, goals: e.target.value})}
                          placeholder="What are your main business objectives for this SEO campaign?"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
                  <div className="p-4 border-b border-lightGray bg-gray-50">
                    <h3 className="text-md font-medium text-dark">Current SEO Status</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Existing Keywords (if any)</label>
                        <textarea 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                          value={onboardingData.existingKeywords}
                          onChange={(e) => setOnboardingData({...onboardingData, existingKeywords: e.target.value})}
                          placeholder="List any keywords you're currently targeting or ranking for"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Content Strategy</label>
                        <textarea 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                          value={onboardingData.contentStrategy}
                          onChange={(e) => setOnboardingData({...onboardingData, contentStrategy: e.target.value})}
                          placeholder="Describe your current content creation process and strategy (if any)"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-mediumGray mb-1">Known Technical Issues</label>
                        <textarea 
                          className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                          value={onboardingData.technicalIssues}
                          onChange={(e) => setOnboardingData({...onboardingData, technicalIssues: e.target.value})}
                          placeholder="List any known technical issues with your website"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
                  <div className="p-4 border-b border-lightGray bg-gray-50">
                    <h3 className="text-md font-medium text-dark">Analytics Access</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <p className="text-sm text-mediumGray">Select the analytics platforms you currently use:</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="ga" 
                            className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                            checked={onboardingData.analytics.googleAnalytics}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData, 
                              analytics: {
                                ...onboardingData.analytics,
                                googleAnalytics: e.target.checked
                              }
                            })}
                          />
                          <label htmlFor="ga" className="ml-2 block text-sm text-dark">Google Analytics</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="gsc" 
                            className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                            checked={onboardingData.analytics.googleSearchConsole}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData, 
                              analytics: {
                                ...onboardingData.analytics,
                                googleSearchConsole: e.target.checked
                              }
                            })}
                          />
                          <label htmlFor="gsc" className="ml-2 block text-sm text-dark">Google Search Console</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="ahrefs" 
                            className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                            checked={onboardingData.analytics.ahrefs}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData, 
                              analytics: {
                                ...onboardingData.analytics,
                                ahrefs: e.target.checked
                              }
                            })}
                          />
                          <label htmlFor="ahrefs" className="ml-2 block text-sm text-dark">Ahrefs</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="semrush" 
                            className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                            checked={onboardingData.analytics.semrush}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData, 
                              analytics: {
                                ...onboardingData.analytics,
                                semrush: e.target.checked
                              }
                            })}
                          />
                          <label htmlFor="semrush" className="ml-2 block text-sm text-dark">SEMrush</label>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-mediumGray mb-1">Other Analytics Tools</label>
                          <input 
                            type="text" 
                            className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={onboardingData.analytics.other}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData, 
                              analytics: {
                                ...onboardingData.analytics,
                                other: e.target.value
                              }
                            })}
                            placeholder="List any other analytics tools you use"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
                  <div className="p-4 border-b border-lightGray bg-gray-50">
                    <h3 className="text-md font-medium text-dark">Additional Information</h3>
                  </div>
                  
                  <div className="p-4">
                    <div>
                      <label className="block text-sm font-medium text-mediumGray mb-1">Additional Notes</label>
                      <textarea 
                        className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary h-32"
                        value={onboardingData.additionalNotes}
                        onChange={(e) => setOnboardingData({...onboardingData, additionalNotes: e.target.value})}
                        placeholder="Any other information that would be helpful for our team"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-200 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
                  >
                    Submit Onboarding
                  </button>
                </div>
              </form>
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
      
      <ChangePasswordModal 
        isOpen={passwordModal.isOpen} 
        accessItem={selectedAccess} 
        onClose={() => setPasswordModal({ isOpen: false, accessId: null })} 
        onSave={handleSavePassword} 
      />
    </DashboardLayout>
  );
}
